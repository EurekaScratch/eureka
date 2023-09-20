import { trap, inject } from './injector/inject';
import { applyFrontend } from './ui';
import { log } from './util/log';

// @ts-expect-error defined in webpack define plugin
log(`Chibi ${__CHIBI_VERSION__}`);
await trap();
if (typeof window.chibi.vm !== 'undefined') {
    inject(window.chibi.vm);
} else {
    log(`Cannot find vm in this page, stop injecting.`);
}

window.onload = () => {
    applyFrontend();
};
