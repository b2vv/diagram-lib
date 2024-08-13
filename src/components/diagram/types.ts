import {Link, Node as NodeDiagram, GraphObject, Diagram, Part, GraphLinksModel, DiagramEvent, Spot as Position} from 'gojs';

import {iconsButtons} from './consts';

type ButtonsKey = typeof iconsButtons[number];
type ButtonCallback = (data?: any) => void;

type ButtonEvent = Partial<Record<ButtonsKey, ButtonCallback>>;

interface INodeData {
    key?: string;
    [key: string]: any;
}

interface ILinkData {
    from: string;
    to: string;
}

interface IIconConfig {
    icon: string;
    name: typeof iconsButtons[number];
    position?: Position;
}

type Builder = typeof GraphObject.make;

type Theme = 'dark' | 'light';

type RenderedType = (isRendered: boolean) => void;
type ConfirmType = () => void;
type DragEvent = (node: INodeData[], parent: INodeData) => void;

export {Link, Diagram, Part, GraphLinksModel, DiagramEvent, Position, NodeDiagram, GraphObject};
export type {
    ButtonEvent,
    ILinkData,
    INodeData,
    IIconConfig,
    ButtonsKey,
    Builder,
    Theme,
    RenderedType,
    ConfirmType,
    DragEvent
};
