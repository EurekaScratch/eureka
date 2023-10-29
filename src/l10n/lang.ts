import { warn } from '../util/log';
const l10n: Record<string, Record<string, string>> = {
    'zh-cn': {
        'chibi.openFrontend': '打开面板',
        'chibi.sideload': '从 URL 侧载扩展',
        'chibi.errorIgnored':
            '在加载扩展扩展时出现错误。为了避免加载进程的中断，此错误已被忽略。',
        'chibi.tryLoad': '🤨 项目正从 {URL} 加载扩展 {EXT_URL}。要加载么？',
        'chibi.tryLoadInEnv':
            '🤨 项目正以 {ENV} 模式从 {URL} 加载扩展 {EXT_URL}。要加载么？',
        'chibi.loadInSandbox': '🤨 要在沙箱模式中加载扩展么？',
        'chibi.enterURL': '🌐 输入',
    },
    en: {
        'chibi.openFrontend': 'Open Frontend',
        'chibi.sideload': 'Sideload from URL',
        'chibi.errorIgnored':
            'Error occurred while sideloading extension. To avoid interrupting the loading process, we chose to ignore this error.',
        'chibi.tryLoad':
            '🤨 Project is trying to sideloading {EXT_URL} from {URL}. Do you want to load?',
        'chibi.tryLoadInEnv':
            '🤨 Project is trying to sideloading {EXT_URL} from {URL} in {ENV} mode. Do you want to load?',
        'chibi.loadInSandbox': '🤨 Do you want to load it in the sandbox?',
        'chibi.enterURL': '🌐 Enter URL',
    },
    ja: {
        'chibi.openFrontend': 'ダッシュボードを開く',
        'chibi.sideload': 'URL から拡張機能を導入',
        'chibi.errorIgnored':
            '拡張機能のサイドロード中でエラーが発生しました。ロードの中断を防ぐために、このエラーは無視しました。',
        'chibi.tryLoad':
            '🤨 プロジェクトは {URL} から {EXT_URL} をサイドロードしています。ロードしますか？',
        'chibi.tryLoadInEnv':
            '🤨 プロジェクトは {ENV} モードで、{URL} から {EXT_URL} をサイドロードしています。ロードしますか？',
        'chibi.loadInSandbox': '🤨 サンドボックス環境でロードしますか？',
        'chibi.enterURL': '🌐 URL を入力してください。',
    },
};
class Language {
    lang: string;
    constructor(lang: string) {
        this.lang = lang;
    }
    format(id: string) {
        if (l10n[this.lang] && id in l10n[this.lang]) {
            return l10n[this.lang][id];
        } else if (l10n['en'] && id in l10n['en']) {
            return l10n['en'][id];
        }
        return id;
    }
}
export default function setup(lang: string): Language {
    if (!(lang in l10n)) {
        warn(
            '🥺 This language is currently not supported. Falling back to English.'
        );
    }
    return new Language(lang);
}
