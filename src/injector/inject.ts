/// <reference path="../global.d.ts" />
import {log, error} from '../util/log';
import { ChibiLoader } from '../loader/loader';
import openFrontend from '../frontend';
import type VM from 'scratch-vm';
import type Blockly from 'scratch-blocks';

interface ChibiCompatibleWorkspace extends Blockly.Workspace {
    registerButtonCallback (key: string, callback: Function): void;
}

interface ChibiCompatibleVM extends VM {
    ccExtensionManager?: {
        info: Record<string, {
            api: number;
        }>;
        getExtensionLoadOrder (extensions: string[]): unknown;
    };
    setLocale?: (locale: string, ...args: unknown[]) => unknown;
}

const MAX_LISTENING_MS = 30 * 1000;


function getBlocklyInstance () {
    const elem = document.querySelector('[class^="gui_blocks-wrapper"]');
    if (!elem) return null;
    const internalKey = Object.keys(elem).find(
        (key) => key.startsWith('__reactInternalInstance$') ||
        key.startsWith('__reactFiber$')
    );
    if (!internalKey) return;
    // @ts-expect-error
    const internal = elem[internalKey];
    let childable = internal;
    while (((childable = childable.child), !childable || !childable.stateNode || !childable.stateNode.ScratchBlocks)) {}
    return childable.stateNode.ScratchBlocks;
}

export function trap () {
    window.chibi = {
        // @ts-expect-error defined in webpack define plugin
        version: __CHIBI_VERSION__,
        registeredExtension: {},
        openFrontend: openFrontend
    };

    log('Listening bind function...');
    const oldBind = Function.prototype.bind;
    return new Promise<void>(resolve => {
        const timeoutId = setTimeout(() => {
            log('Cannot find vm instance, stop listening.');
            Function.prototype.bind = oldBind;
            resolve();
        }, MAX_LISTENING_MS);

        Function.prototype.bind = function (...args) {
            if (Function.prototype.bind === oldBind) {
                return oldBind.apply(this, args);
            } else if (
                args[0] &&
                Object.prototype.hasOwnProperty.call(args[0], "editingTarget") &&
                Object.prototype.hasOwnProperty.call(args[0], "runtime")
            ) {
                log('VM detected!');
                window.chibi.vm = args[0];
                Function.prototype.bind = oldBind;
                clearTimeout(timeoutId);
                resolve();
                return oldBind.apply(this, args);
            }
            return oldBind.apply(this, args);
        };
    });
}

export function inject (vm: ChibiCompatibleVM) {
    const loader = window.chibi.loader = new ChibiLoader(vm);
    const originalLoadFunc = vm.extensionManager.loadExtensionURL;
    vm.extensionManager.loadExtensionURL = async function (extensionURL: string, ...args: unknown[]) {
        if (extensionURL in window.chibi.registeredExtension) {
            const { url, env } = window.chibi.registeredExtension[extensionURL];
            try {
                if (confirm(`🤨 Project is trying to sideloading ${extensionURL} from ${url} in ${env} mode. Do you want to load?`)) {
                    await loader.load(url, env as 'unsandboxed' | 'sandboxed');
                    const extensionId = loader.getIdByUrl(url);
                    // @ts-expect-error internal hack
                    vm.extensionManager._loadedExtensions.set(extensionId, 'Chibi');
                } else {
                    // @ts-expect-error internal hack
                    return originalLoadFunc.call(this, extensionURL, ...args);
                }
            } catch (e: unknown) {
                error('Error occurred while sideloading extension. To avoid interrupting the loading process, we chose to ignore this error.', e);
            }
        } else {
            // @ts-expect-error internal hack
            return originalLoadFunc.call(this, extensionURL, ...args);
        }
    };

    const originalRefreshBlocksFunc = vm.extensionManager.refreshBlocks;
    vm.extensionManager.refreshBlocks = async function (...args: unknown[]) {
        // @ts-expect-error internal hack
        const result = await originalRefreshBlocksFunc.call(this, ...args);
        await window.chibi.loader.refreshBlocks();
        return result;
    };

    const originalToJSONFunc = vm.toJSON;
    vm.toJSON = function (optTargetId: string, ...args: unknown[]) {
        // @ts-expect-error internal hack
        const json = originalToJSONFunc.call(this, optTargetId, ...args);
        const obj = JSON.parse(json);
        const [urls, envs] = window.chibi.loader.getLoadedInfo();
        obj.extensionURLs = Object.assign({}, urls);
        obj.extensionEnvs = Object.assign({}, envs);
        return JSON.stringify(obj);
    };
    
    const originalDrserializeFunc = vm.deserializeProject;
    vm.deserializeProject = function (projectJSON: Record<string, any>, ...args: unknown[]) {
        if (typeof projectJSON.extensionURLs === 'object') {
            for (const id in projectJSON.extensionURLs) {
                window.chibi.registeredExtension[id] = {
                    url: projectJSON.extensionURLs[id],
                    env: typeof projectJSON.extensionEnvs === 'object' ?
                        projectJSON.extensionEnvs[id] : 'sandboxed'
                };
            }
        }
        // @ts-expect-error internal hack
        return originalDrserializeFunc.call(this, projectJSON, ...args);
    };

    const originSetLocaleFunc = vm.setLocale;
    vm.setLocale = function (locale: string, ...args: unknown[]) {
        // @ts-expect-error internal hack
        const result = originSetLocaleFunc.call(this, locale, ...args);
        // @ts-expect-error lazy to extend VM interface
        vm.emit('LOCALE_CHANGED', locale);
        return result;
    };

    // Hack for ClipCC 3.2- versions
    if (typeof vm.ccExtensionManager === 'object') {
        const originalGetOrderFunc = vm.ccExtensionManager.getExtensionLoadOrder;
        vm.ccExtensionManager.getExtensionLoadOrder = function (extensions: string[], ...args: unknown[]) {
            for (const extensionId of extensions) {
                if (
                    !vm.ccExtensionManager!.info.hasOwnProperty(extensionId) &&
                    extensionId in window.chibi.registeredExtension
                ) {
                    vm.ccExtensionManager!.info[extensionId] = {
                        api: 0
                    };
                }
            }
            // @ts-expect-error internal hack
            return originalGetOrderFunc.call(this, extensions, ...args);
        };
    }

    // Blockly stuffs
    setTimeout(() => {
        const blockly = window.chibi.blockly = getBlocklyInstance();
        if (!blockly) return;

        const originalAddCreateButton_ = blockly.Procedures.addCreateButton_;
        blockly.Procedures.addCreateButton_ = function (
            workspace: ChibiCompatibleWorkspace,
            xmlList: unknown[],
            ...args: unknown[]
        ) {
            originalAddCreateButton_.call(this, workspace, xmlList, ...args);
            const dashboardButton = document.createElement('button');
            dashboardButton.setAttribute('text', '😎 Chibi Management');
            dashboardButton.setAttribute('callbackKey', 'CHIBI_FRONTEND');
            workspace.registerButtonCallback('CHIBI_FRONTEND', () => {
                window.chibi.openFrontend();
            });
            xmlList.push(dashboardButton);
        };
        const workspace = blockly.getMainWorkspace();
        workspace.getToolbox().refreshSelection();
        workspace.toolboxRefreshEnabled_ = true;
    }, 5000);
}
