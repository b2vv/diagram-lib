import React from 'react';

import {PortalComponent} from '@src/components/portal';
import type {ModalFC} from './types';
import styles from '../index.module.scss';
// data-bs-theme="dark"
export const ModalComponent: ModalFC = React.memo((props) => (
    <>
        {
            (props.isOpen ?? true) ? (
                <PortalComponent handleClose={props.closeHandle}>
                    <div className={`${styles.modal} ${styles.show}`} tabIndex={-1}>
                        <div className={`${styles['modal-dialog']} js-close-modal`}>
                            <div className={styles['modal-content']}>
                                {props.children}
                            </div>
                        </div>
                    </div>
                    <div className={`${styles['modal-backdrop']} ${styles.fade} ${styles.show}`} />
                </PortalComponent>
            ) : (<></>)
        }
    </>
));

ModalComponent.displayName = 'ModalComponent';

