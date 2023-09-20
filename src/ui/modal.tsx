import { Button } from './button';

interface ModalProps {
    onClickOustside: () => void;
}

function sideload () {
    const url = prompt('Enter extension URL');
    if (!url) return;
    const env = confirm('Is it running in sandbox?');
    window.chibi.loader.load(url, env ? 'sandboxed' : 'unsandboxed');
}

export function Modal (props: ModalProps) {
    return (
        <>
            <style jsx>{`
            .overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: var(--ui-modal-overlay);
                z-index: 11726;
            }

            .header {
                display: flex;
                flex-direction: row;
                flex-wrap: nowrap;
                justify-content: center;
                height: var(--library-header-height);

                box-sizing: border-box;
                width: 100%;
                background-color: var(--pen-primary);

                font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
                font-size: 1rem;
                font-weight: normal;
            }

            .modal * {
                box-sizing: border-box;
            }

            .modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                margin: 100px auto;
                max-width: 900px;
                outline: none;
                border: 4px solid var(--ui-white-transparent);
                padding: 0;
                border-radius: var(--space);
                user-select: none;

                font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
                color: var(--text-primary);
                overflow: hidden;
                z-index: 11727;
            }

            .title {
                display: flex;
                align-items: center;
                padding: 1rem;
                text-decoration: none;
                color: white;
                user-select: none;
            }

            .body {
                background: white;
                height: 100%;
                max-height: 80vh;
                display: flex;
                flex-direction: column;
                width: 900px;
                padding: 1.5rem 2.25rem;
                overflow-y: auto;
            }
            `}</style>
            <div className='overlay' onClick={props.onClickOutside} />
            <div className='modal'>
                <div className='header'>
                    <div className='title'>
                        Chibi Settings
                    </div>
                </div>
                <div className='body'>
                    <Button onClick={sideload}>
                        Sideload Extension from URL
                    </Button>
                </div>
            </div>
        </>
    );
}
