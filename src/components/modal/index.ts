import {HeaderComponent} from './components/header.component';
import {BodyComponent} from './components/body.component';
import {FooterComponent} from './components/footer.component';
import {ModalComponent} from './components/modal.component';
import type {IModalStruct} from './components/types';
export * from './hooks/use-modal.hook';

export const Modal: IModalStruct = {
    Dialog: ModalComponent,
    Header: HeaderComponent,
    Body: BodyComponent,
    Footer: FooterComponent
};
