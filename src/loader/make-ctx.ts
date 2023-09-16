import {
    BlockType,
    TargetType,
    ArgumentType,
    ReporterScope,
    StandardScratchExtensionClass as ExtensionClass
} from '../typings';
import { Cast } from '../util/cast';
import type VM from 'scratch-vm';

export interface Ctx {
    ArgumentType: typeof ArgumentType;
    BlockType: typeof BlockType;
    TargetType: typeof TargetType;
    ReporterScope: typeof ReporterScope;
    Cast: Cast;
    extensions: {
        register: (extensionObj: ExtensionClass) => void,
        unsandboxed: boolean,
        chibi: true
    }
    vm?: VM;
}

export function makeCtx (sandboxed = false) {
    const ctx: Ctx = {
        ArgumentType: ArgumentType,
        BlockType: BlockType,
        TargetType: TargetType,
        ReporterScope: ReporterScope,
        Cast: Cast,
        extensions: {
            register: () => {
                throw new Error('not implemented');
            },
            unsandboxed: !sandboxed,
            chibi: true
        }
    };
    if (!sandboxed) {
        ctx.vm = null as unknown as VM;
    }
    return ctx;
}
