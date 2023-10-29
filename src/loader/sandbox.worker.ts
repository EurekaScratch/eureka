/* eslint-env worker */
import { makeCtx, Context } from './make-ctx';
import { WorkerDispatch as dispatch } from './dispatch/worker-dispatch';

declare global {
    // eslint-disable-next-line no-var
    var Scratch: Context;
}
/**
 * Here we implements a Worker dispatcher for sandboxed extensions.
 */
class ExtensionWorker {
    nextExtensionId = 0;
    initialRegistrations: Promise<unknown>[] = [];
    extensions: unknown[] = [];
    workerId?: number;
    extensionURL = '';
    constructor () {
        dispatch.waitForConnection.then(() => {
            dispatch.call('loader', 'allocateWorker').then((x) => {
                const [id, url] = x;
                this.workerId = id;
                this.extensionURL = url;

                try {
                    importScripts(url);

                    const initialRegistrations = this.initialRegistrations;
                    this.initialRegistrations = [];

                    Promise.all(initialRegistrations).then(() =>
                        dispatch.call('scratchAdapter', 'onWorkerInit', id)
                    );
                } catch (e) {
                    dispatch.call('scratchAdapter', 'onWorkerInit', id, e);
                }
            });
        });

        this.extensions = [];
    }

    register (extensionObject: unknown) {
        const extensionId = this.nextExtensionId++;
        this.extensions.push(extensionObject);
        const serviceName = `extension.${this.workerId}.${extensionId}`;
        const promise = dispatch
            .setService(serviceName, extensionObject)
            .then(() =>
                dispatch.call('loader', 'registerExtensionService', this.extensionURL, serviceName)
            );
        if (this.initialRegistrations) {
            this.initialRegistrations.push(promise);
        }
        return promise;
    }
}

globalThis.Scratch = makeCtx();

/**
 * Expose only specific parts of the worker to extensions.
 */
const extensionWorker = new ExtensionWorker();
globalThis.Scratch.extensions.register = extensionWorker.register.bind(extensionWorker);

export default null as unknown as any;
