import React from 'react';

import {OnlyChildrenProps} from './types';
import styles from '../index.module.scss';

export const FooterComponent: OnlyChildrenProps = React.memo((props) => (
    <div className={styles['modal-footer']}>
        {props.children}
    </div>
));

FooterComponent.displayName = 'FooterComponent';
