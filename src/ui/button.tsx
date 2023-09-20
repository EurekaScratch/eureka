import { JSXElement } from 'react';

interface ButtonProps {
    onClick: () => void;
    children: JSXElement;
}

export function Button (props: ButtonProps) {
    return (
        <>
            <style jsx>{`
            .button {
                border: none;
                background-color: var(--pen-primary);
                cursor: pointer;
                border-radius: var(--form-radius);
                font-weight: bold;
                display: flex;
                flex-direction: row;
                align-items: center;
                padding: 0 .75rem;
                user-select: none;
                white-space: nowrap;
                color: white;
                width: fit-content;
                height: 34px;
            }
            `}</style>
            <button
                className='button'
                onClick={props.onClick}
            >
                {props.children}
            </button>
        </>
    );
}
