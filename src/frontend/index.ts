let dashboardWindow: Window | null = null;

interface MothExtensionInfo {
    name: string;
    sandboxed: boolean;
}

interface MothDispatchedLoad {
    type: 'load';
    info: {
        url: string;
        sandboxed: boolean;
    }
}

interface MothDispatchedAllocate {
    type: 'allocate';
}

type MothDispatched = MothDispatchedAllocate | MothDispatchedLoad;

function getExtensionInfo () {
    const processedExtInfo: MothExtensionInfo[] = [];
    for (const [extId, ext] of window.chibi.loader.loadedScratchExtension.entries()) {
        processedExtInfo.push({
            name: extId,
            sandboxed: ext.env === 'sandboxed'
        });
    }
    return processedExtInfo;
}

async function messageHandler (event: MessageEvent) {
    if (event.origin !== 'https://chibi.codingclip.cc') return;
    if (!('type' in event.data)) return;
    switch ((event.data as MothDispatched).type) {
    case 'allocate': 
        console.log('handshake with frontend');
        dashboardWindow?.postMessage({
            type: 'handshake',
            clientInfo: {
                version: Number(window.chibi.version),
                url: window.location.host
            }
        }, '*');
        dashboardWindow?.postMessage({
            type: 'extension',
            extensions: getExtensionInfo()
        }, '*');
        break;
    case 'load':
        await window.chibi.loader.load(event.data.info.url, event.data.info.sandboxed ? 'sandboxed' : 'unsandboxed');
        dashboardWindow?.postMessage({
            type: 'extension',
            extensions: getExtensionInfo()
        }, '*');
        break;
    }
}

window.addEventListener('message', messageHandler);

function openFrontend () {
    dashboardWindow = window.open('https://chibi.codingclip.cc/#manage');
}

export default openFrontend;
