import { useState } from 'react';
import { Button } from './button';
import { Modal } from './modal';
import { error } from '../util/log';
import { createRoot } from 'react-dom/client';

export function EntryComponent () {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    return (
        <>
            <style>{`
            body {
                --chibi-primary: #f7c7bb;
                --pen-primary: hsla(163, 85%, 40%, 1);
                --pen-transparent: hsla(163, 85%, 40%, 0.25);
                --space: 0.5rem;
                --form-radius: calc(var(--space) / 2);
                --ui-modal-overlay: hsla(215, 100%, 65%, 0.9);
                --library-header-height: 3.125rem;
                --text-primary: hsla(225, 15%, 40%, 1);
                --ui-white-transparent: hsla(0, 100%, 100%, 0.25);
                font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
            }
            `}</style>
            <Button onClick={() => setIsModalOpen(true)}>
                Chibi
            </Button>
            {isModalOpen && <Modal onClickOutside={() => setIsModalOpen(false)} />}
        </>
    );
}

export function applyFrontend () {
    const baseElement = document.createElement('div');
    createRoot(baseElement).render(<EntryComponent />);
    const menuBar = document.querySelector("[class*='gui_menu-bar']");
    if (menuBar) {
        baseElement.style = `margin: auto 1rem;`;
        menuBar.appendChild(baseElement);
    } else {
        baseElement.style = `position: fixed; top: 90%; left: 90%; z-index: 5000;`;
        document.body.appendChild(baseElement);
    }
}
