import React from 'react';
import ReactDOM from 'react-dom';

interface IPortalProps {
    handleClose?: () => void;
    theme?: 'dark' | 'light';
}

export const PortalComponent: React.FC<React.PropsWithChildren<IPortalProps>> = React.memo((props) => {
    const el = React.useMemo(() => document.createElement('div'), []);
    const {theme = 'light'} = props;
    el.className = 'portal';
    const {handleClose} = props;

    const closeHandler = React.useCallback((e: Event) => {
        const elem = e.target as HTMLElement;
        if (!elem.closest('.js-close-modal')) {
            handleClose?.();
        }
    }, [handleClose]);

    React.useEffect(() => {
        el.setAttribute('data-bs-theme', theme)
    }, [theme]);

    React.useLayoutEffect(() => {
        if (handleClose) {
            document.body.classList.add('modal-open');
        }
        el.addEventListener('mousedown', closeHandler);
        document.body.appendChild(el);
        return () => {
            document.body.classList.remove('modal-open');
            el.removeEventListener('mousedown', closeHandler);
            document.body.removeChild(el);
        };
    }, [closeHandler, el, handleClose]);

    return ReactDOM.createPortal(
        props.children,
        el
    );
});

PortalComponent.displayName = 'PortalComponent';
