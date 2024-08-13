import addIcon from './icons/file-plus.svg';
import editIcon from './icons/pen-to-square.svg';
import deleteIcon from './icons/eraser.svg';

import {IIconConfig, Position} from './types';

export const iconsButtons = ['add', 'edit', 'delete'] as const;

export const configButton: Record<typeof iconsButtons[number], IIconConfig> = {
    add: {
        icon: addIcon,
        name: 'add',
        position: Position.TopRight
    },
    edit: {
        icon: editIcon,
        name: 'edit',
        position: Position.Right
    },
    delete: {
        icon: deleteIcon,
        name: 'delete',
        position: Position.BottomRight
    }
};

