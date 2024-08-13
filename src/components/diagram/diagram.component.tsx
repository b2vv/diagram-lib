import React, {
    FC,
    memo,
    MutableRefObject,
    PropsWithChildren, useCallback, useEffect,
    useId,
    useMemo
} from 'react';
import go from 'gojs';

import {ButtonEvent, ConfirmType, GraphObject, DragEvent, ILinkData, INodeData, RenderedType, Theme} from './types';
import {IRefType} from './useDiagram';
import {initDiagram} from './config/init';
import {getLayout} from './config/layout';
import {getNodeTemplate} from './config/node';
import {getLinkTemplate} from './config/link';
import styles from './index.module.css';

interface IDiagramProps {
    nodeArr: INodeData[];
    linkArr: ILinkData[];
    diagramRef: MutableRefObject<IRefType>;
    theme: Theme;
    onCreate?: (data: INodeData) => void;
    onEdit?: (data: INodeData) => void;
    onConfirm?: ConfirmType;
    onRenderComplete?: RenderedType;
    onLinkChanged?: DragEvent;
}

export const DiagramComponent: FC<PropsWithChildren<IDiagramProps>> = memo((props) => {
    const elementID = useId();
    const $ = useMemo(() => GraphObject.make, []);
    const {diagramRef, onCreate, onRenderComplete, onEdit, onConfirm, onLinkChanged} = props;
    const buttons = useMemo(() => {
        const btns: ButtonEvent = {};
        if (onCreate) {
            btns.add = onCreate;
        }
        if (onEdit) {
            btns.edit = onEdit;
        }
        if (onConfirm) {
            btns.delete = onConfirm;
        }
        return btns;
    }, [onConfirm, onCreate, onEdit]);

    useEffect(() => {
        if (!diagramRef.current.diagram) {
            const diagram = initDiagram(elementID, $, {
                onConfirm,
                onRenderComplete,
                onLinkChanged
            });
            diagramRef.current.diagram = diagram;
            diagram.layout = getLayout($);
            diagram.nodeTemplate = getNodeTemplate($, diagramRef, buttons);
            diagram.linkTemplate = getLinkTemplate($);
            diagram.model = new go.GraphLinksModel(props.nodeArr, props.linkArr);
        }
    }, [$, buttons, diagramRef, elementID, onConfirm, onLinkChanged, onRenderComplete, props.linkArr, props.nodeArr]);

    const changeTheme = useCallback((theme: Theme) => {
        if (diagramRef.current.diagram) {
            diagramRef.current.diagram.themeManager.currentTheme = theme;
        }
    }, [diagramRef]);

    useEffect(() => {
        changeTheme(props.theme);
    }, [changeTheme, props.theme]);

    React.useEffect(() => {
        if (diagramRef.current.diagram) {
            diagramRef.current.diagram.model = new go.GraphLinksModel(props.nodeArr, props.linkArr);
        }
    }, [diagramRef, props.nodeArr, props.linkArr]);

    return (
        <>
            <div className={styles['gojs-wrapper-div']}>
                <div id={elementID} className={styles['diagram-component']} />
            </div>
            {props.children}
        </>
    );
});

DiagramComponent.displayName = 'DiagramComponent';
