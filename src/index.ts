import { getVMInstance, getBlocklyInstance } from './util/hijack';
import { injectVM, injectBlockly, initalizeEureka } from './injector/inject';
import { log } from './util/log';
// @ts-expect-error defined in webpack define plugin
log(`eureka-loader ${__EUREKA_VERSION__}`);
// Initialize Eureka global object.
initalizeEureka();
// Try injecting Eureka into the page.
const vm = await getVMInstance();
if (vm) {
    // Alright we got the virtual machine, start the injection.
    window.eureka.vm = vm;
    injectVM(vm);
    getBlocklyInstance(vm).then(blockly => injectBlockly(blockly));
} else {
    // This is not a Scratch page, stop injecting.
    log(`Cannot find vm in this page, stop injecting.`);
}
