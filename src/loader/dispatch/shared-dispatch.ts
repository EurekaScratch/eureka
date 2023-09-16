/**
 * A message to the dispatch system representing a service method call
 */
export interface DispatchCallMessage {
    /**
     * Send a response message with this response ID. See {@link DispatchResponseMessage}
     */
    responseId: number;
    /**
     * The name of the service to be called
     */
    service: string;
    /**
     * The name of the method to be called
     */
    method: string;
    /**
     * The arguments to be passed to the method
     */
    args?: unknown[];
}

/**
 * A message to the dispatch system representing the results of a call
 */
export interface DispatchResponseMessage {
    /**
     * A copy of the response ID from the call which generated this response
     */
    responseId: number;
    /**
     * If this is truthy, then it contains results from a failed call (such as an exception)
     */
    error?: unknown;
    /**
     * If error is not truthy, then this contains the return value of the call (if any)
     */
    result?: unknown;
}

/**
 * @typedef {DispatchCallMessage|DispatchResponseMessage} DispatchMessage
 * Any message to the dispatch system.
 */
/**
 * The SharedDispatch class is responsible for dispatch features shared by
 * {@link CentralDispatch} and {@link WorkerDispatch}.
 */
class SharedDispatch {
    /**
     * List of callback registrations for promises waiting for a response from a call to a service on another
     * worker. A callback registration is an array of [resolve,reject] Promise functions.
     * Calls to local services don't enter this list.
     * @type {Array.<Function[]>}
     */
    callbacks: [(value: unknown) => void, (value: unknown) => void][] = [];
    /**
     * The next response ID to be used.
     * @type {int}
     */
    nextResponseId = 0;
    /**
     * Call a particular method on a particular service, regardless of whether that service is provided locally or on
     * a worker. If the service is provided by a worker, the `args` will be copied using the Structured Clone
     * algorithm, except for any items which are also in the `transfer` list. Ownership of those items will be
     * transferred to the worker, and they should not be used after this call.
     * @example
     *      dispatcher.call('vm', 'setData', 'cat', 42);
     *      // this finds the worker for the 'vm' service, then on that worker calls:
     *      vm.setData('cat', 42);
     * @param {string} service - the name of the service.
     * @param {string} method - the name of the method.
     * @param {*} [args] - the arguments to be copied to the method, if any.
     * @returns {Promise} - a promise for the return value of the service method.
     */
    call (service: string, method: string, ...args: unknown[]) {
        return this.transferCall(service, method, null, ...args);
    }
    /**
     * Call a particular method on a particular service, regardless of whether that service is provided locally or on
     * a worker. If the service is provided by a worker, the `args` will be copied using the Structured Clone
     * algorithm, except for any items which are also in the `transfer` list. Ownership of those items will be
     * transferred to the worker, and they should not be used after this call.
     * @example
     *      dispatcher.transferCall('vm', 'setData', [myArrayBuffer], 'cat', myArrayBuffer);
     *      // this finds the worker for the 'vm' service, transfers `myArrayBuffer` to it, then on that worker calls:
     *      vm.setData('cat', myArrayBuffer);
     * @param {string} service - the name of the service.
     * @param {string} method - the name of the method.
     * @param {Array} [transfer] - objects to be transferred instead of copied. Must be present in `args` to be useful.
     * @param {*} [args] - the arguments to be copied to the method, if any.
     * @returns {Promise} - a promise for the return value of the service method.
     */
    transferCall (service: string, method: string, transfer: unknown, ...args: unknown[]) {
        try {
            // @ts-expect-error TS(2339): It's not implemented.
            const {provider, isRemote} = this._getServiceProvider(service);
            if (provider) {
                if (isRemote) {
                    return this._remoteTransferCall(provider, service, method, transfer, ...args);
                }
                const result = provider[method](...args);
                return Promise.resolve(result);
            }
            return Promise.reject(new Error(`Service not found: ${service}`));
        } catch (e) {
            return Promise.reject(e);
        }
    }
    /**
     * Check if a particular service lives on another worker.
     * @param {string} service - the service to check.
     * @returns {boolean} - true if the service is remote (calls must cross a Worker boundary), false otherwise.
     * @private
     */
    _isRemoteService (service: string): boolean {
        // @ts-expect-error TS(2339): It's not implemented.
        return this._getServiceProvider(service).isRemote;
    }
    /**
     * Like {@link call}, but force the call to be posted through a particular communication channel.
     * @param {object} provider - send the call through this object's `postMessage` function.
     * @param {string} service - the name of the service.
     * @param {string} method - the name of the method.
     * @param {*} [args] - the arguments to be copied to the method, if any.
     * @returns {Promise} - a promise for the return value of the service method.
     */
    _remoteCall (provider: any, service: string, method: string, ...args: unknown[]): Promise<unknown> {
        return this._remoteTransferCall(provider, service, method, null, ...args);
    }
    /**
     * Like {@link transferCall}, but force the call to be posted through a particular communication channel.
     * @param {object} provider - send the call through this object's `postMessage` function.
     * @param {string} service - the name of the service.
     * @param {string} method - the name of the method.
     * @param {Array} [transfer] - objects to be transferred instead of copied. Must be present in `args` to be useful.
     * @param {*} [args] - the arguments to be copied to the method, if any.
     * @returns {Promise} - a promise for the return value of the service method.
     */
    _remoteTransferCall (provider: Worker, service: string, method: string, transfer: unknown, ...args: unknown[]) {
        return new Promise((resolve, reject) => {
            const responseId = this._storeCallbacks(resolve, reject);
            if (args) {
                args = this._purifyObject(args) as unknown[];
            }
            if (transfer) {
                provider.postMessage({service, method, responseId, args}, transfer);
            } else {
                provider.postMessage({service, method, responseId, args});
            }
        });
    }
    /**
     * Store callback functions pending a response message.
     * @param {Function} resolve - function to call if the service method returns.
     * @param {Function} reject - function to call if the service method throws.
     * @returns {*} - a unique response ID for this set of callbacks. See {@link _deliverResponse}.
     * @protected
     */
    _storeCallbacks (resolve: (value: unknown) => void, reject: (value: unknown) => void) {
        const responseId = this.nextResponseId++;
        this.callbacks[responseId] = [resolve, reject];
        return responseId;
    }
    /**
     * Deliver call response from a worker. This should only be called as the result of a message from a worker.
     * @param {int} responseId - the response ID of the callback set to call.
     * @param {DispatchResponseMessage} message - the message containing the response value(s).
     * @protected
     */
    _deliverResponse (responseId: number, message: DispatchResponseMessage) {
        try {
            const [resolve, reject] = this.callbacks[responseId];
            delete this.callbacks[responseId];
            if (message.error) {
                reject(message.error);
            } else {
                resolve(message.result);
            }
        } catch (e) {
            console.error(`Dispatch callback failed: ${e}`);
        }
    }
    /**
     * Handle a message event received from a connected worker.
     * @param {Worker} worker - the worker which sent the message, or the global object if running in a worker.
     * @param {MessageEvent} event - the message event to be handled.
     * @protected
     */
    _onMessage (worker: Worker, event: MessageEvent) {
        /** @type {DispatchMessage} */
        const message = event.data;
        message.args = message.args || [];
        let promise: Promise<unknown> | void = undefined;
        if (message.service) {
            if (message.service === 'dispatch') {
                promise = this._onDispatchMessage(worker, message);
            } else {
                promise = this.call(message.service, message.method, ...message.args);
            }
        } else if (typeof message.responseId === 'undefined') {
            console.error(`Dispatch caught malformed message from a worker: ${JSON.stringify(event)}`);
        } else {
            this._deliverResponse(message.responseId, message);
        }
        if (promise) {
            if (typeof message.responseId === 'undefined') {
                console.error(`Dispatch message missing required response ID: ${JSON.stringify(event)}`);
            } else {
                promise.then(result => worker.postMessage({responseId: message.responseId, result}), error => worker.postMessage({responseId: message.responseId, error: `${error}`}));
            }
        }
    }
    /**
     * Fetch the service provider object for a particular service name.
     * @abstract
     * @param {string} service - the name of the service to look up
     * @returns {{provider:(object|Worker), isRemote:boolean}} - the means to contact the service, if found
     * @protected
     */
    _getServiceProvider (service: string) {
        throw new Error(`Could not get provider for ${service}: _getServiceProvider not implemented`);
    }
    /**
     * Handle a call message sent to the dispatch service itself
     * @abstract
     * @param {Worker} worker - the worker which sent the message.
     * @param {DispatchCallMessage} message - the message to be handled.
     * @returns {Promise|undefined} - a promise for the results of this operation, if appropriate
     * @private
     */
    _onDispatchMessage (worker: Worker, message: DispatchCallMessage) {
        throw new Error(`Unimplemented dispatch message handler cannot handle ${message.method} method`);
    }

    /**
     * Purify an object so that it can be safely transferred to the worker.
     * @param {obj} object - The Object that need to be purified.
     * @returns {object} - purified object.
     */
    _purifyObject (obj: unknown, visited = new Set(), depth = 1): unknown {
        if (typeof obj === "function" || typeof obj === "symbol") {
            return undefined;
        }

        if (obj !== null && typeof obj === "object") {
            if (visited.has(obj)) return undefined;
            visited.add(obj);

            if (Array.isArray(obj)) {
                return obj.map((item) => this._purifyObject(item, visited, depth + 1));
            } 
            const result: Record<string, unknown> = {};
            for (const key in obj) {
                // @ts-expect-error
                const value = obj[key];
                result[key] = this._purifyObject(value, visited, depth + 1);
            }
            return result;
            
        }
        return obj;
    }
}

export {
    SharedDispatch
};
