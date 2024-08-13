import React from 'react';

import {HeaderProps} from './types';
import styles from '../index.module.scss';

export const HeaderComponent: HeaderProps = React.memo((props) => (
    <div className={styles['modal-header']}>
        <h5 className={styles['modal-title']}>{props.children}</h5>
        <button type='button'
            onClick={props.closeHandle}
            className={styles['btn-close']}
            data-bs-dismiss='modal'
            aria-label='Close'
        />
    </div>
));

HeaderComponent.displayName = 'HeaderComponent';
