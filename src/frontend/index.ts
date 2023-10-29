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
    };
}

interface MothDispatchedAllocate {
    type: 'allocate';
}

type MothDispatched = MothDispatchedAllocate | MothDispatchedLoad;

/**
 * Get all extensions.
 * @returns Extensions.
 */
function getExtensionInfo() {
    const processedExtInfo: MothExtensionInfo[] = [];
    for (const [extId, ext] of window.chibi.loader.loadedScratchExtension.entries()) {
        processedExtInfo.push({
            name: extId,
            sandboxed: ext.env === 'sandboxed'
        });
    }
    return processedExtInfo;
}
/**
 * Handle messages from the frontend (popup window).
 * @param event Event from the frontend.
 */
async function messageHandler(event: MessageEvent) {
    if (event.origin !== 'https://chibi.codingclip.cc') return;
    if (!('type' in event.data)) return;
    switch ((event.data as MothDispatched).type) {
        // Handshake: send current extension info in order to prepare frontend.
        case 'allocate':
            console.log('handshake with frontend');
            dashboardWindow?.postMessage(
                {
                    type: 'handshake',
                    clientInfo: {
                        version: Number(window.chibi.version),
                        url: window.location.host
                    }
                },
                '*'
            );
            dashboardWindow?.postMessage(
                {
                    type: 'extension',
                    extensions: getExtensionInfo()
                },
                '*'
            );
            break;
        case 'load':
            // Load an extension.
            await window.chibi.loader.load(
                event.data.info.url,
                event.data.info.sandboxed ? 'sandboxed' : 'unsandboxed'
            );
            dashboardWindow?.postMessage(
                {
                    type: 'extension',
                    extensions: getExtensionInfo()
                },
                '*'
            );
            break;
    }
}

// Here we add a listener to process the message
window.addEventListener('message', messageHandler);

/**
 * Open the popup (?) window.
 * @param open window.open function (compatible with ccw).
 */
function openFrontend(open: typeof window.open) {
    dashboardWindow = open(
        'https://chibi.codingclip.cc/#manage',
        'Chibi',
        'popup=yes,status=no,location=no,toolbar=no,menubar=no'
    );
}

export default openFrontend;
