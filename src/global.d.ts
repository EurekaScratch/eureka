/// <reference path="node_modules/@turbowarp/types/index.d.ts" />
// <reference path="./loader/loader" />

declare interface Window {
    chibi: {
        version: string;
        vm?: VM;
        loader?: ChibiLoader;
        registeredExtension: Record<string, string>;
    }
}
