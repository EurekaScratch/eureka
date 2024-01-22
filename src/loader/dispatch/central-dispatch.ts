import { SharedDispatch, DispatchCallMessage } from './shared-dispatch';
/**
 * This class serves as the central broker for message dispatch. It expects to operate on the main thread / Window and
 * it must be informed of any Worker threads which will participate in the messaging system. From any context in the
 * messaging system, the dispatcher's "call" method can call any method on any "service" provided in any participating
 * context. The dispatch system will forward function arguments and return values across worker boundaries as needed.
 * @see {WorkerDispatch}
 */
class _CentralDispatch extends SharedDispatch {
    services: Record<string, any>;
    /**
     * The constructor we will use to recognize workers.
     * @type {Worker | null}
     */
    workerClass: typeof Worker | null = typeof Worker === 'undefined' ? null : Worker;
    /**
     * List of workers attached to this dispatcher.
     * @type {Array}
     */
    workers: Worker[] = [];
    _onMessage!: (worker: Worker, event: MessageEvent) => void;
    constructor () {
        super();
        /**
         * Map of channel name to worker or local service provider.
         * If the entry is a Worker, the service is provided by an object on that worker.
         * Otherwise, the service is provided locally and methods on the service will be called directly.
         * @see {setService}
         * @type {object.<Worker|object>}
         */
        this.services = {};
    }
    /**
     * Synchronously call a particular method on a particular service provided locally.
     * Calling this function on a remote service will fail.
     * @param {string} service - the name of the service.
     * @param {string} method - the name of the method.
     * @param {*} [args] - the arguments to be copied to the method, if any.
     * @returns {*} - the return value of the service method.
     */
    callSync (service: string, method: string, ...args: unknown[]) {
        const { provider, isRemote } = this._getServiceProvider(service);
        if (provider) {
            if (isRemote) {
                throw new Error(`Cannot use 'callSync' on remote provider for service ${service}.`);
            }
            return provider[method](...args);
        }
        throw new Error(`Provider not found for service: ${service}`);
    }
    /**
     * Synchronously set a local object as the global provider of the specified service.
     * WARNING: Any method on the provider can be called from any worker within the dispatch system.
     * @param {string} service - a globally unique string identifying this service. Examples: 'vm', 'gui', 'extension9'.
     * @param {object} provider - a local object which provides this service.
     */
    setServiceSync (service: string, provider: any) {
        if (Object.prototype.hasOwnProperty.call(this.services, service)) {
            console.warn(`Central dispatch replacing existing service provider for ${service}`);
        }
        this.services[service] = provider;
    }
    /**
     * Set a local object as the global provider of the specified service.
     * WARNING: Any method on the provider can be called from any worker within the dispatch system.
     * @param {string} service - a globally unique string identifying this service. Examples: 'vm', 'gui', 'extension9'.
     * @param {object} provider - a local object which provides this service.
     * @returns {Promise} - a promise which will resolve once the service is registered.
     */
    setService (service: string, provider: any) {
        /** Return a promise for consistency with {@link WorkerDispatch#setService} */
        try {
            this.setServiceSync(service, provider);
            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    }
    /**
     * Add a worker to the message dispatch system. The worker must implement a compatible message dispatch framework.
     * The dispatcher will immediately attempt to "handshake" with the worker.
     * @param {Worker} worker - the worker to add into the dispatch system.
     */
    addWorker (worker: Worker) {
        if (this.workers.indexOf(worker) === -1) {
            this.workers.push(worker);
            worker.onmessage = this._onMessage.bind(this, worker);
            this._remoteCall(worker, 'dispatch', 'handshake').catch((e) => {
                console.error(`Could not handshake with worker: ${e}`);
            });
        } else {
            console.warn('Central dispatch ignoring attempt to add duplicate worker');
        }
    }
    /**
     * Fetch the service provider object for a particular service name.
     * @override
     * @param {string} service - the name of the service to look up
     * @returns {{provider:(object|Worker), isRemote:boolean}} - the means to contact the service, if found
     * @protected
     */
    _getServiceProvider (service: string) {
        const provider = this.services[service];
        return (
            provider && {
                provider,
                isRemote: Boolean(
                    (this.workerClass && provider instanceof this.workerClass) || provider.isRemote
                )
            }
        );
    }
    /**
     * Handle a call message sent to the dispatch service itself
     * @override
     * @param {Worker} worker - the worker which sent the message.
     * @param {DispatchCallMessage} message - the message to be handled.
     * @returns {Promise|undefined} - a promise for the results of this operation, if appropriate
     * @protected
     */
    _onDispatchMessage (worker: Worker, message: DispatchCallMessage) {
        let promise;
        switch (message.method) {
            case 'setService':
                if (!message.args) {
                    console.error('setService received empty argument');
                    break;
                }
                promise = this.setService(String(message.args[0]), worker);
                break;
            default:
                console.error(
                    `Central dispatch received message for unknown method: ${message.method}`
                );
        }
        return promise;
    }
}

export type CentralDispatch = _CentralDispatch;

export const CentralDispatch = new _CentralDispatch();
