import { trap, inject } from './injector/inject';
import { log } from './util/log';
const open = window.open;
// @ts-expect-error defined in webpack define plugin
log(`eureka-loader ${__EUREKA_VERSION__}`);
// Try injecting chibi into the page.
await trap(open);
if (typeof window.eureka.vm !== 'undefined') {
    // Alright we got the virtual machine, start the injection.
    inject(window.eureka.vm);
} else {
    // This is not a Scratch page, stop injecting.
    log(`Cannot find vm in this page, stop injecting.`);
}
