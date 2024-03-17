import { trap, inject } from './injector/inject';
import { log } from './util/log';
const open = window.open;
// @ts-expect-error defined in webpack define plugin
log(`eureka-loader ${__EUREKA_VERSION__}`);
// Try injecting chibi into the page.
const [vm, blockly] = await trap(open);
if (!!vm) {
    // Alright we got the virtual machine, start the injection.
    window.eureka.vm = vm;
    inject(vm, blockly);
} else {
    // This is not a Scratch page, stop injecting.
    log(`Cannot find vm in this page, stop injecting.`);
}
