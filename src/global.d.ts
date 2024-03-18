/* eslint-disable multiline-comment-style */
/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="node_modules/@turbowarp/types/index.d.ts" />
/// <reference path="node_modules/format-message/types.d.ts" />
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
        format?: formatMessage;
        openFrontend(): void;
    };
    Scratch?: Context;
}
