/// <reference path="../global.d.ts" />
import { log, warn, error } from '../util/log';
import { ChibiLoader } from '../loader/loader';
import openFrontend from '../frontend';
import type VM from 'scratch-vm';
import type Blockly from 'scratch-blocks';
import * as l10n from '../l10n/l10n.json';
import formatMessage from 'format-message';

interface ChibiCompatibleWorkspace extends Blockly.Workspace {
    registerButtonCallback(key: string, callback: Function): void;
}

interface ChibiCompatibleVM extends VM {
    ccExtensionManager?: {
        info: Record<
            string,
            {
                api: number;
            }
        >;
        getExtensionLoadOrder(extensions: string[]): unknown;
    };
    setLocale?: (locale: string, ...args: unknown[]) => unknown;
    getLocale?: () => string;
}

const MAX_LISTENING_MS = 30 * 1000;

/**
 * Get Blockly instance.
 * @param vm Virtual machine instance. For some reasons we cannot use VM here.
 * @returns Blockly instance.
 */
function getBlocklyInstance (vm: any): any | undefined {
    // Hijack Function.prototype.apply to get React element instance.
    function hijack (fn: (...args: unknown[]) => void): any {
        const _orig = Function.prototype.apply;
        Function.prototype.apply = function (thisArg: any) {
            return thisArg;
        };
        const result = fn();
        Function.prototype.apply = _orig;
        return result;
    }
    const events = vm._events?.EXTENSION_ADDED;
    if (events) {
        if (events instanceof Function) {
            // It is a function, just hijack it.
            const result = hijack(events);
            if (result && result.ScratchBlocks) return result.ScratchBlocks;
        } else {
            // It is an array, hijack every listeners.
            for (const value of events) {
                const result = hijack(value);
                if (result && result.ScratchBlocks) return result.ScratchBlocks;
            }
        }
    }
    return undefined; // Method failed.
}

/**
 * Trap to get Virtual Machine instance.
 * @param open window.open function (compatible with ccw).
 * @return Callback promise. After that you could use window.chibi.vm to get the virtual machine.
 */
export function trap (open: typeof window.open): Promise<void> {
    window.chibi = {
        // @ts-expect-error defined in webpack define plugin
        version: __CHIBI_VERSION__,
        registeredExtension: {},
        openFrontend: openFrontend.bind(null, open)
    };

    log('Listening bind function...');
    const oldBind = Function.prototype.bind;
    return new Promise<void>((resolve) => {
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
                Object.prototype.hasOwnProperty.call(args[0], 'editingTarget') &&
                Object.prototype.hasOwnProperty.call(args[0], 'runtime')
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

/**
 * Inject into the original virtual machine.
 * @param vm {ChibiCompatibleVM} Original virtual machine instance.
 */
export function inject (vm: ChibiCompatibleVM) {
    const loader = (window.chibi.loader = new ChibiLoader(vm));
    const originalLoadFunc = vm.extensionManager.loadExtensionURL;
    const getLocale = vm.getLocale;
    const format = formatMessage.namespace();
    format.setup({
        locale: getLocale ? getLocale.call(vm) : 'en',
        missingTranslation: 'ignore',
        generateId: (defaultMessage: string) => `${defaultMessage}`,
        translations: l10n
    });
    vm.extensionManager.loadExtensionURL = async function (
        extensionURL: string,
        ...args: unknown[]
    ) {
        if (extensionURL in window.chibi.registeredExtension) {
            const { url, env } = window.chibi.registeredExtension[extensionURL];
            try {
                const res = env
                    ? confirm(
                        format('chibi.tryLoadInEnv', {
                            extensionURL,
                            url,
                            env
                        })
                    )
                    : confirm(
                        format('chibi.tryLoadInEnv', {
                            extensionURL,
                            url
                        })
                    );
                if (res) {
                    await loader.load(
                        url,
                        (env
                            ? env
                            : confirm(format('chibi.loadInSandbox'))
                                ? 'sandboxed'
                                : 'unsandboxed') as 'unsandboxed' | 'sandboxed'
                    );
                    const extensionId = loader.getIdByUrl(url);
                    // @ts-expect-error internal hack
                    vm.extensionManager._loadedExtensions.set(extensionId, 'Chibi');
                } else {
                    // @ts-expect-error internal hack
                    return originalLoadFunc.call(this, extensionURL, ...args);
                }
            } catch (e: unknown) {
                error(format('chibi.errorIgnored'), e);
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
        obj.extensionURLs = Object.assign({}, obj.extensionURLs, urls);
        obj.extensionEnvs = Object.assign({}, obj.extensionEnvs, envs);
        return JSON.stringify(obj);
    };

    const originalDrserializeFunc = vm.deserializeProject;
    vm.deserializeProject = function (projectJSON: Record<string, any>, ...args: unknown[]) {
        if (typeof projectJSON.extensionURLs === 'object') {
            for (const id in projectJSON.extensionURLs) {
                window.chibi.registeredExtension[id] = {
                    url: projectJSON.extensionURLs[id],
                    env:
                        typeof projectJSON.extensionEnvs === 'object'
                            ? projectJSON.extensionEnvs[id]
                            : 'sandboxed'
                };
            }
        }
        // @ts-expect-error internal hack
        return originalDrserializeFunc.call(this, projectJSON, ...args);
    };

    const originSetLocaleFunc = vm.setLocale;
    vm.setLocale = function (locale: string, ...args: unknown[]) {
        format.setup({
            locale,
            missingTranslation: 'ignore',
            generateId: (defaultMessage: string) => `${defaultMessage}`,
            translations: l10n
        });
        // @ts-expect-error internal hack
        const result = originSetLocaleFunc.call(this, locale, ...args);
        // @ts-expect-error lazy to extend VM interface
        vm.emit('LOCALE_CHANGED', locale);
        return result;
    };
    // TODO: compiler support
    const originalArgReporterBooleanFunc = vm.runtime._primitives.argument_reporter_boolean;
    vm.runtime._primitives.argument_reporter_boolean = function (
        args: Record<string, unknown>,
        ...otherArgs: unknown[]
    ) {
        const chibiFlag = args.VALUE;
        switch (chibiFlag) {
            case '🧐 Chibi Installed?':
                warn("'🧐 Chibi Installed?' is deprecated, use '🧐 Chibi?' instead.");
                return true;
            case '🧐 Chibi?':
                return true;
            default:
                return originalArgReporterBooleanFunc.call(this, args, ...otherArgs);
        }
    };

    // Hack for ClipCC 3.2- versions
    if (typeof vm.ccExtensionManager === 'object') {
        const originalGetOrderFunc = vm.ccExtensionManager.getExtensionLoadOrder;
        vm.ccExtensionManager.getExtensionLoadOrder = function (
            extensions: string[],
            ...args: unknown[]
        ) {
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
        const blockly = (window.chibi.blockly = getBlocklyInstance(vm));
        // Deprecated: this method will be removed in the future.
        if (!blockly) {
            warn('Cannot find real blockly instance, try alternative method...');
            const originalProcedureCallback =
                window.Blockly?.getMainWorkspace().toolboxCategoryCallbacks_.PROCEDURE;
            if (!originalProcedureCallback) {
                error('alternative method failed, stop injecting');
                return;
            }
            window.Blockly.getMainWorkspace().toolboxCategoryCallbacks_.PROCEDURE = function (
                workspace: ChibiCompatibleWorkspace,
                ...args: unknown[]
            ) {
                const xmlList = originalProcedureCallback.call(this, workspace, ...args);
                // Add separator and label
                const sep = document.createElement('sep');
                sep.setAttribute('gap', '36');
                xmlList.push(sep);
                const label = document.createElement('label');
                label.setAttribute('text', '😎 Chibi');
                xmlList.push(label);

                // Add dashboard button
                const dashboardButton = document.createElement('button');
                dashboardButton.setAttribute('text', format('chibi.openFrontend'));
                dashboardButton.setAttribute('callbackKey', 'CHIBI_FRONTEND');
                workspace.registerButtonCallback('CHIBI_FRONTEND', () => {
                    window.chibi.openFrontend();
                });
                xmlList.push(dashboardButton);

                // Add load from url button
                const sideloadButton = document.createElement('button');
                sideloadButton.setAttribute('text', format('chibi.sideload'));
                sideloadButton.setAttribute('callbackKey', 'CHIBI_SIDELOAD_FROM_URL');
                workspace.registerButtonCallback('CHIBI_SIDELOAD_FROM_URL', () => {
                    const url = prompt(format('chibi.enterURL'));
                    if (!url) return;
                    const mode = confirm(format('chibi.loadInSandbox'))
                        ? 'sandboxed'
                        : 'unsandboxed';
                    window.chibi.loader.load(url, mode);
                });
                xmlList.push(sideloadButton);

                // Add chibi detection
                const mutation = document.createElement('mutation');
                mutation.setAttribute('chibi', 'installed');
                const field = document.createElement('field');
                field.setAttribute('name', 'VALUE');
                field.innerHTML = '🧐 Chibi?';
                const block = document.createElement('block');
                block.setAttribute('type', 'argument_reporter_boolean');
                block.setAttribute('gap', '16');
                block.appendChild(field);
                block.appendChild(mutation);
                xmlList.push(block);
                return xmlList;
            };
            const workspace = window.Blockly.getMainWorkspace();
            workspace.getToolbox().refreshSelection();
            workspace.toolboxRefreshEnabled_ = true;
            return;
        }
        const originalAddCreateButton_ = blockly.Procedures.addCreateButton_;
        blockly.Procedures.addCreateButton_ = function (
            workspace: ChibiCompatibleWorkspace,
            xmlList: unknown[],
            ...args: unknown[]
        ) {
            originalAddCreateButton_.call(this, workspace, xmlList, ...args);
            // Add separator and label
            const sep = document.createElement('sep');
            sep.setAttribute('gap', '36');
            xmlList.push(sep);
            const label = document.createElement('label');
            label.setAttribute('text', '😎 Chibi');
            xmlList.push(label);

            // Add dashboard button
            const dashboardButton = document.createElement('button');
            dashboardButton.setAttribute('text', format('chibi.openFrontend'));
            dashboardButton.setAttribute('callbackKey', 'CHIBI_FRONTEND');
            workspace.registerButtonCallback('CHIBI_FRONTEND', () => {
                window.chibi.openFrontend();
            });
            xmlList.push(dashboardButton);

            // Add load from url button
            const sideloadButton = document.createElement('button');
            sideloadButton.setAttribute('text', format('chibi.sideload'));
            sideloadButton.setAttribute('callbackKey', 'CHIBI_SIDELOAD_FROM_URL');
            workspace.registerButtonCallback('CHIBI_SIDELOAD_FROM_URL', () => {
                const url = prompt(format('chibi.enterURL'));
                if (!url) return;
                const mode = confirm(format('chibi.loadInSandbox')) ? 'sandboxed' : 'unsandboxed';
                window.chibi.loader.load(url, mode);
            });
            xmlList.push(sideloadButton);

            // Add chibi detection
            const mutation = document.createElement('mutation');
            mutation.setAttribute('chibi', 'installed');
            const field = document.createElement('field');
            field.setAttribute('name', 'VALUE');
            field.innerHTML = '🧐 Chibi?';
            const block = document.createElement('block');
            block.setAttribute('type', 'argument_reporter_boolean');
            block.setAttribute('gap', '16');
            block.appendChild(field);
            block.appendChild(mutation);
            xmlList.push(block);
        };
        const workspace = blockly.getMainWorkspace();
        workspace.getToolbox().refreshSelection();
        workspace.toolboxRefreshEnabled_ = true;
    }, 3000);
}
