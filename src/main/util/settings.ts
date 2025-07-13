// Types for our settings system
type Callback = (path: string[], value: any, previousValue: any) => void;
interface Settings {
    trap: {
        vm: boolean;
        redux: boolean;
        blocks: boolean;
    },
    mixins: {
        'vm.extensionManager.loadExtensionURL': boolean;
        'vm.extensionManager.refreshBlocks': boolean;
        'vm.toJSON': boolean;
        'vm.deserializeProject': boolean;
        'vm._loadExtensions': boolean;
        'vm.setLocale': boolean;
        'vm.runtime._primitives.argument_reporter_boolean': boolean;
        'vm.exports.ScriptTreeGenerator.prototype.descendInput': boolean;
        'vm.ccExtensionManager.getExtensionLoadOrder': boolean;
        'vm.ccExtensionManager.getLoadedExtensions': boolean;
        'blocks.Procedures.addCreateButton_': boolean;
        'blocks.getMainWorkspace().toolboxCategoryCallbacks_.PROCEDURE': boolean;
        'blocks.WorkspaceSvg.prototype.registerToolboxCategoryCallback': boolean;
        'blocks.getMainWorkspace().toolboxCategoryCallbacks.PROCEDURE': boolean;
        'vm.runtime._convertForScratchBlocks': boolean;
        'vm.runtime._convertButtonForScratchBlocks': boolean;
        'blocks.Blocks.argument_reporter_boolean.init': boolean;
    },
    behavior: {
        redirectURL: boolean;
        redirectDeclared: boolean;
        exposeCtx: boolean;
        headless: boolean;
        polyfillGlobalInstances: boolean;
    },
    lang: string;
}

const defaultSettings: Settings = {
    trap: {
        vm: true,
        redux: false,
        blocks: true
    },
    behavior: {
        redirectURL: false,
        redirectDeclared: true,
        exposeCtx: false,
        headless: false,
        polyfillGlobalInstances: false
    },
    mixins: {
        'vm.extensionManager.loadExtensionURL': true,
        'vm.extensionManager.refreshBlocks': true,
        'vm.toJSON': true,
        'vm.deserializeProject': true,
        'vm._loadExtensions': true,
        'vm.setLocale': true,
        'vm.runtime._primitives.argument_reporter_boolean': true,
        'vm.exports.ScriptTreeGenerator.prototype.descendInput': true,
        'vm.ccExtensionManager.getExtensionLoadOrder': true,
        'vm.ccExtensionManager.getLoadedExtensions': true,
        'blocks.Procedures.addCreateButton_': true,
        'blocks.getMainWorkspace().toolboxCategoryCallbacks_.PROCEDURE': true,
        'blocks.WorkspaceSvg.prototype.registerToolboxCategoryCallback': true,
        'blocks.getMainWorkspace().toolboxCategoryCallbacks.PROCEDURE': true,
        'blocks.Blocks.argument_reporter_boolean.init': true,
        'vm.runtime._convertButtonForScratchBlocks': true,
        'vm.runtime._convertForScratchBlocks': true
    },
    lang: 'follow'
};

export class SettingsAgent {
    private callbacks: Set<Callback> = new Set();
    private readonly storageKey: string;
    private readonly defaultSettings: Settings;
    public settings: Settings;

    constructor (storageKey: string, defaults: Settings) {
        this.storageKey = storageKey;
        this.defaultSettings = defaults;

        // Initialize settings from localStorage or default
        let savedSettings = localStorage.getItem(storageKey);
        if (!savedSettings) {
            savedSettings = '{}';
            localStorage.setItem(storageKey, JSON.stringify(defaultSettings));
        }
        this.settings = savedSettings ?
            this.mergeWithDefaults(JSON.parse(savedSettings), defaultSettings) :
            {...defaultSettings};

        // Create proxy-based settings
        this.settings = this.createProxy(this.settings);
    }

    private mergeWithDefaults (saved: Settings, defaults: Settings): Settings {
        const result: Settings = {...defaults};

        for (const key in saved) {
            if (typeof saved[key] === 'object' && saved[key] !== null &&
                typeof defaults[key] === 'object' && defaults[key] !== null) {
                result[key] = this.mergeWithDefaults(saved[key], defaults[key]);
            } else if (key in defaults) {
                result[key] = saved[key];
            }
        }

        return result;
    }

    private createProxy (obj: Settings, path: string[] = []): Settings {
        return new Proxy(obj, {
            get: (target, prop: string) => {
                const value = target[prop];
                if (value && typeof value === 'object') {
                    return this.createProxy(value, [...path, prop]);
                }
                return value;
            },

            set: (target, prop: string, value: any) => {
                const oldValue = target[prop];
                target[prop] = value;

                // Notify callbacks
                const currentPath = [...path, prop];
                this.callbacks.forEach(callback =>
                    callback(currentPath, value, oldValue)
                );

                // Sync with localStorage
                localStorage.setItem(this.storageKey, JSON.stringify(this.settings));

                return true;
            }
        });
    }

    // Subscribe to settings changes
    public subscribe (callback: Callback): () => void {
        this.callbacks.add(callback);
        return () => this.callbacks.delete(callback);
    }

    // Reset settings to defaults
    public reset (): void {
        Object.keys(this.settings).forEach(key => delete this.settings[key]);
        Object.assign(this.settings, this.defaultSettings);
        localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
    }

    // Get current settings
    public getSettings (): Settings {
        return this.settings;
    }
}

export default new SettingsAgent('$eureka', defaultSettings);
