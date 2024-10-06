import packageJSON from '../package.json';
export { injectVM, injectBlockly } from './injector/inject';
export { settings } from './util/settings';
import openFrontend from './frontend';
export { openFrontend };
export const version = packageJSON.version;
