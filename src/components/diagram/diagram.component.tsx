import React, {
    FC,
    memo,
    MutableRefObject,
    PropsWithChildren,
    useCallback,
    useEffect,
    useId, useLayoutEffect,
    useMemo, useRef,
} from 'react';
import go from 'gojs';

import {
    ButtonEvent,
    ConfirmType,
    GraphObject,
    DragEvent,
    ILinkData,
    INodeData,
    RenderedType,
    Theme,
} from './types';
import {IRefType} from './useDiagram';
import {initDiagram} from './config/init';
import {getLayout} from './config/layout';
import {getNodeTemplate} from './config/node';
import {getLinkTemplate} from './config/link';
import styles from './index.module.css';
import {DocumentDimension} from "../calc-diagram/tidy";

interface IDiagramProps {
    nodeArr?: INodeData[];
    linkArr?: ILinkData[];
    documentSize: DocumentDimension;
    setViewPortDimension: (size: DocumentDimension) => void;
    diagramRef: MutableRefObject<IRefType>;
    theme?: Theme;
    onCreate?: (data: INodeData) => void;
    onEdit?: (data: INodeData) => void;
    onConfirm?: ConfirmType;
    onRenderComplete?: RenderedType;
    onLinkChanged?: DragEvent;
}


export const DiagramComponent: FC<PropsWithChildren<IDiagramProps>> = memo(
    (props) => {
        const elementID = useId();
        const $ = useMemo(() => GraphObject.make, []);
        const {
            theme = 'dark',
            documentSize,
            diagramRef,
            onCreate,
            onRenderComplete,
            onEdit,
            onConfirm,
            onLinkChanged,
        } = props;
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
                const events =
                {
                    onConfirm,
                    onRenderComplete,
                    onLinkChanged,
                    setViewPortDimension: props.setViewPortDimension
                };
                const diagram = initDiagram(elementID, $, events);

                diagramRef.current.diagram = diagram;
                diagram.layout = getLayout($);
                diagram.nodeTemplate = getNodeTemplate($, (node) => diagramRef.current.currentNode = node, buttons);
                diagram.linkTemplate = getLinkTemplate($);
                diagram.model = new go.GraphLinksModel(props.nodeArr, props.linkArr);
            }
        }, [
            $,
            buttons,
            diagramRef,
            elementID,
            onConfirm,
            onLinkChanged,
            onRenderComplete,
            props.linkArr,
            props.nodeArr,
        ]);

        const changeTheme = useCallback(
            (theme: Theme) => {
                if (diagramRef.current.diagram) {
                    diagramRef.current.diagram.themeManager.currentTheme = theme;
                }
            },
            [diagramRef]
        );

        useEffect(() => {
            if (diagramRef.current?.diagram) {
                const [topX, topY, bottomX, bottomY] = documentSize;
                const width = bottomX - topX;
                const height = bottomY - topY;

                diagramRef.current.diagram.fixedBounds = new go.Rect(topX, topY, width, height);
            }
        }, [documentSize]);

        useEffect(() => {
            changeTheme(theme);
        }, [changeTheme, theme]);

        React.useEffect(() => {
            if (diagramRef.current.diagram) {
                diagramRef.current.diagram.model = new go.GraphLinksModel(
                    props.nodeArr,
                    props.linkArr
                );
            }
        }, [diagramRef, props.nodeArr, props.linkArr]);

        return (
            <>
                <div className={styles['gojs-wrapper-div']}>
                    <div id={elementID} className={styles['diagram-component']}/>
                </div>
                {props.children}
            </>
        );
    }
);

DiagramComponent.displayName = 'DiagramComponent';
