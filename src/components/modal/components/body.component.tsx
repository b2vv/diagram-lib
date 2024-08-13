import React from 'react';

import {OnlyChildrenProps} from './types';
import styles from '../index.module.scss';

export const BodyComponent: OnlyChildrenProps = React.memo((props) => (
    <div className={styles['modal-body']}>
        {props.children}
    </div>
));

BodyComponent.displayName = 'ModalBodyComponent';
