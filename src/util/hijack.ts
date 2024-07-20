// eslint-disable-next-line @typescript-eslint/triple-slash-reference

import { log } from '../util/log';
import type Blockly from 'scratch-blocks';
import type { EurekaCompatibleVM } from '../typings/compatible-vm';

const MAX_LISTENING_MS = 30 * 1000;

/**
 * Get Blockly instance.
 * @param vm Virtual machine instance. For some reasons we cannot use VM here.
 * @returns Blockly instance.
 */
export async function getBlocklyInstance (vm: EurekaCompatibleVM): Promise<typeof Blockly> {
    function getBlocklyInstanceInternal (): any | null {
        // Hijack Function.prototype.apply to get React element instance.
        function hijack (fn: (...args: unknown[]) => unknown) {
            const _orig = Function.prototype.apply;
            Function.prototype.apply = function (thisArg: any) {
                return thisArg;
            };
            const result = fn();
            Function.prototype.apply = _orig;
            return result;
        }

        // @ts-expect-error lazy to extend VM interface
        const events = vm._events?.EXTENSION_ADDED;
        if (events) {
            if (events instanceof Function) {
                // It is a function, just hijack it.
                const result = hijack(events);
                if (result && typeof result === 'object' && 'ScratchBlocks' in result) {
                    return result.ScratchBlocks;
                }
            } else {
                // It is an array, hijack every listeners.
                for (const value of events) {
                    const result = hijack(value);
                    if (result && typeof result === 'object' && 'ScratchBlocks' in result) {
                        return result.ScratchBlocks;
                    }
                }
            }
        }
        return null;
    }
    if (getBlocklyInstance.cache) {
        return getBlocklyInstance.cache;
    }
    let res = getBlocklyInstanceInternal();
    if (res) {
        return (getBlocklyInstance.cache = res);
    }
    return new Promise((resolve) => {
        let state: any = undefined;
        // @ts-expect-error lazy to extend VM interface
        Reflect.defineProperty(vm._events, 'EXTENSION_ADDED', {
            get: () => state,
            set (v) {
                state = v;
                res = getBlocklyInstanceInternal();
                if (res) {
                    // @ts-expect-error lazy to extend VM interface
                    Reflect.defineProperty(vm._events, 'EXTENSION_ADDED', {
                        value: state,
                        writable: true
                    });
                    getBlocklyInstance.cache = res;
                    resolve(res);
                }
            },
            configurable: true
        });
    });
}
getBlocklyInstance.cache = null as typeof Blockly | null;

/**
 * Trap to get Virtual Machine instance.
 * @return Callback promise. After that you could use window.eureka.vm to get the virtual machine.
 */
export async function getVMInstance (): Promise<EurekaCompatibleVM | null> {
    log('Listening bind function...');
    const oldBind = Function.prototype.bind;
    try {
        const vm = await new Promise<EurekaCompatibleVM>((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                log('Cannot find vm instance, stop listening.');
                Function.prototype.bind = oldBind;
                reject();
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
                    Function.prototype.bind = oldBind;
                    clearTimeout(timeoutId);
                    resolve(args[0]);
                    return oldBind.apply(this, args);
                }
                return oldBind.apply(this, args);
            };
        });
        return vm;
    } catch {
        return null;
    }
}
