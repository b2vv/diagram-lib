type EventModal = (data?: any) => void | {
    label?: string;
    callback: (data?: any) => void;
};

export interface IModalsEvent {
    handleConfirm?: EventModal;
    handleClose?: EventModal;
}

export interface IModalSettings<T> {
    attrs?: T;
    events: IModalsEvent;
}
