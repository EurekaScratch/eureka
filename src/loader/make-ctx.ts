import {
    BlockType,
    TargetType,
    ArgumentType,
    ReporterScope,
    StandardScratchExtensionClass as ExtensionClass
} from '../typings';
import { Cast } from '../util/cast';
import formatMessage, { Message } from 'format-message';
import type VM from 'scratch-vm';
import type Renderer from 'scratch-render';

export interface Context {
    ArgumentType: typeof ArgumentType;
    BlockType: typeof BlockType;
    TargetType: typeof TargetType;
    ReporterScope: typeof ReporterScope;
    Cast: Cast;
    translate: ReturnType<typeof createTranslate>;
    extensions: {
        register: (extensionObj: ExtensionClass) => void;
        unsandboxed: boolean;
        chibi: true;
        eureka: true;
    };
    vm?: VM;
    renderer?: Renderer;
}
/**
 * I10n support for Eureka extensions.
 * @param vm Virtual machine instance. Optional.
 * @returns Something like Scratch.translate.
 */
function createTranslate (vm?: VM) {
    const namespace = formatMessage.namespace();

    const translate = (message: Message, args?: object) => {
        if (message && typeof message === 'object') {
            // Already in the expected format
        } else if (typeof message === 'string') {
            message = {
                default: message
            };
        } else {
            throw new Error('unsupported data type in translate()');
        }
        return namespace(message, args);
    };

    const generateId = (defaultMessage: string) => `_${defaultMessage}`;

    const getLocale = () => {
        // @ts-expect-error lazy to extend VM interface
        if (vm) return vm.getLocale();
        if (typeof navigator !== 'undefined') return navigator.language; // FIXME: en-US -> en
        return 'en';
    };

    let storedTranslations = {};
    translate.setup = (newTranslations: Message | {} | null) => {
        if (newTranslations) {
            storedTranslations = newTranslations;
        }
        namespace.setup({
            locale: getLocale(),
            missingTranslation: 'ignore',
            generateId,
            translations: storedTranslations
        });
    };

    translate.setup({});

    if (vm) {
        // @ts-expect-error emitted by eureka
        vm.on('LOCALE_CHANGED', () => {
            translate.setup(null);
        });
    }

    return translate;
}
/**
 * Make a fake scratch context.
 * @param vm Virtual machine instance.
 * @returns The context.
 */
export function makeCtx (vm?: VM) {
    const ctx: Context = {
        ArgumentType: ArgumentType,
        BlockType: BlockType,
        TargetType: TargetType,
        ReporterScope: ReporterScope,
        Cast: Cast,
        extensions: {
            register: () => {
                throw new Error('not implemented');
            },
            unsandboxed: !!vm,
            chibi: true,
            eureka: true
        },
        translate: createTranslate(vm)
    };
    if (vm) {
        ctx.vm = vm;
        ctx.renderer = vm.runtime.renderer;
    }
    return ctx;
}
