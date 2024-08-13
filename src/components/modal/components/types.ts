import React from 'react';

export type OnlyChildrenProps = React.FC<React.PropsWithChildren>;


interface IModalHeaderProps {
    closeHandle: () => void;
}

export type HeaderProps = React.FC<React.PropsWithChildren<IModalHeaderProps>>;

interface IModalProps {
    isOpen?: boolean;
    closeHandle: () => void;
}

export type ModalFC = React.FC<React.PropsWithChildren<IModalProps>>;

export interface IModalStruct {
    Dialog: ModalFC;
    Header: HeaderProps;
    Body: OnlyChildrenProps;
    Footer: OnlyChildrenProps;
}
