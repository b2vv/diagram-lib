import React, {SetStateAction} from 'react';

import {IModalSettings, IModalsEvent} from '../types';
import {PortalComponent} from '@src/components/portal';

export type IComponentProps<T> = IModalsEvent & T;

interface IModal<T> extends IModalSettings<T> {
    component: React.FC<IComponentProps<T>>;
}

export function useModal<T>(modal: IModal<T>, theme: 'dark' | 'light' = 'light') {
    const {component: Element, events} = modal;
    const {handleClose} = events;
    const [isOpen, setIsOpen] = React.useState(false);
    const [props, setProps] = React.useState<T>(modal.attrs ?? {} as T);

    const close = React.useCallback(() => {
        setIsOpen(false);
    }, []);

    const open = React.useCallback((attrs?: T) => {
        setIsOpen(true);
        setProps(attrs ?? modal?.attrs ?? {} as SetStateAction<T>);
    }, [modal?.attrs]);

    const changeProps = React.useCallback((attrs: T) => {
        setProps(attrs);
    }, []);

    const updateProps = React.useCallback((attrs: T) => {
        setProps((prevState) => ({...prevState, attrs}));
    }, []);

    const closeHandle = React.useCallback(() => {
        handleClose?.();
        close();
    }, [close, handleClose]);

    const modalElem = React.useMemo(() => (
        <PortalComponent handleClose={close} theme={theme}>
            <Element {...props} {...events} handleClose={closeHandle} />
            <div className='modal-backdrop fade show' />
        </PortalComponent>
    ), [Element, close, closeHandle, events, props, theme]);

    return {
        modal: isOpen && modalElem,
        changeProps,
        updateProps,
        close,
        open
    };
}
