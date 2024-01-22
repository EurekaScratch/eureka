// eslint-disable-next-line multiline-comment-style
/// <reference path="node_modules/@turbowarp/types/index.d.ts" />
/// <reference path="./loader/loader" />
/// <reference path="./loader/make-ctx" />
/// <reference path="./util/settings" />

declare interface Window {
    Blockly?: Partial<ScratchBlocks>;
    eureka: {
        version: string;
        vm?: VM;
        blockly?: ScratchBlocks | null;
        loader?: EurekaLoader;
        settings: Settings;
        registeredExtension: Record<
            string,
            {
                url: string;
                env: string;
            }
        >;
        openFrontend(): void;
    };
    Scratch?: Context;
}
