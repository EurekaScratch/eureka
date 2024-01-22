export interface Settings {
    convertProcCall: boolean;
    dontExposeCtx: boolean;
    noConfirmDialog: boolean;
    sideloadOnly: boolean;
}

const puppet: Settings = {
    convertProcCall: true,
    dontExposeCtx: false,
    noConfirmDialog: false,
    sideloadOnly: true
};

const SETTINGS_KEY = '$CHIBI_SETTINGS';

if (!window.localStorage.getItem(SETTINGS_KEY)) {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(puppet));
}

export function getSettingsFromStorage (): Settings | null {
    try {
        const item = window.localStorage.getItem(SETTINGS_KEY);
        if (!item) return null;
        return JSON.parse(item);
    } catch (_: unknown) {
        return null;
    }
}

export const settings = new Proxy(puppet, {
    get (target, prop) {
        const storage = getSettingsFromStorage();
        if (!storage || !(prop in storage)) return Reflect.get(target, prop);
        return Reflect.get(storage, prop);
    },
    set (target, prop, value) {
        let storage = getSettingsFromStorage();
        if (!storage) {
            storage = Object.assign({}, puppet);
        }
        Reflect.set(storage, prop, value);
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(storage));
        return true;
    }
});
