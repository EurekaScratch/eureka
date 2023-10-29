export interface Settings {
    convertProcCall: boolean;
    dontExposeCtx: boolean;
    noConfirmDialog: boolean;
    takeOverUrlLoadRequest: boolean;
}

const puppet: Settings = {
    convertProcCall: true,
    dontExposeCtx: false,
    noConfirmDialog: false,
    takeOverUrlLoadRequest: false
};

const SETTINGS_KEY = '$CHIBI_SETTINGS';

if (!window.localStorage.getItem(SETTINGS_KEY)) {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(puppet));
}

function getSettingsFromStorage () {
    try {
        const item = window.localStorage.getItem(SETTINGS_KEY);
        if (!item) return null;
        return JSON.parse(item);
    } catch (_: unknown) {
        return null;
    }
}

function saveSettingsToStorage (prop: string, value: string) {
    try {
        const item = window.localStorage.getItem(SETTINGS_KEY);
        if (!item) throw 'missing item';
        const obj = JSON.parse(item);
        obj[prop] = value;
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(obj));
    } catch (_: unknown) {
        const newObject = Object.assign({}, puppet, {
            [prop]: value
        });
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(newObject));
    }
}

export const settings = new Proxy(puppet, {
    get (target, prop) {
        const storage = getSettingsFromStorage();
        if (!storage || !(prop in storage)) return target[prop as keyof Settings];
        return storage[prop];
    },
    set (target, prop, value) {
        let storage = getSettingsFromStorage();
        if (!storage) {
            storage = Object.assign({}, puppet);
        }
        storage[prop] = value;
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(storage));
        return true;
    }
});
