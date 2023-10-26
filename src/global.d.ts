/// <reference path="node_modules/@turbowarp/types/index.d.ts" />
// <reference path="./loader/loader" />

declare interface Window {
    Blockly?: Partial<ScratchBlocks>;
    chibi: {
        version: string;
        vm?: VM;
        blockly?: ScratchBlocks | null;
        loader?: ChibiLoader;
        registeredExtension: Record<string, {
            url: string,
            env: string
        }>;
        openFrontend (): void;
    }
}
