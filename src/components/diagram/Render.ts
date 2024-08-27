import go from 'gojs';

import {Disposable} from '../dispose';
import {ButtonEvent, ConfirmType, DragEvent, GraphObject, ILinkData, INodeData, RenderedType, Theme} from './types';
import {initDiagram} from './config/init';
import {getLayout} from './config/layout';
import {getLinkTemplate} from './config/link';
import {getNodeTemplate} from './config/node';
import {Node} from "../calc-diagram/tidy";

interface IEvent {
    onCreate?: (data: INodeData) => void;
    onEdit?: (data: INodeData) => void;
    onConfirm?: ConfirmType;
    onRenderComplete?: RenderedType;
    onLinkChanged?: DragEvent;
}

export class Render extends Disposable{
    private diagram!: go.Diagram;
    private currentNode?: go.Node;
    private $ = GraphObject.make;

    private setNode = (node: go.Node) => {
        this.currentNode = node;
    };


    public init(elementID: string, event: IEvent) {
        const buttons = () => {
            const btns: ButtonEvent = {};
            if (event?.onCreate) {
                btns.add = event.onCreate;
            }
            if (event?.onEdit) {
                btns.edit = event.onEdit;
            }
            if (event?.onConfirm) {
                btns.delete = event.onConfirm;
            }
            return btns;
        };

        const diagram = initDiagram(elementID, this.$, {
            onConfirm: event?.onConfirm,
            onRenderComplete: event?.onRenderComplete,
            onLinkChanged: event?.onLinkChanged
        });
        diagram.layout = getLayout(this.$);
        diagram.linkTemplate = getLinkTemplate(this.$);
        diagram.nodeTemplate = getNodeTemplate(this.$, this.setNode, buttons());
        this.diagram = diagram;
    }

    public getNode() {
        return this.currentNode;
    }

    public changeTheme(theme: Theme) {
        this.diagram.themeManager.currentTheme = theme;
    }

    public setData(nodeArr: INodeData[], linkArr: ILinkData[]) {
        this.diagram.model = new go.GraphLinksModel(nodeArr, linkArr);
    }

    public updateData(tree: Node) {
        this.diagram.model = new go.TreeModel(tree);
    }

    public setTreeData(nodeArr: INodeData[], linkArr: ILinkData[]) {
        this.diagram.model = new go.GraphLinksModel(nodeArr, linkArr);
    }

    public clear() {
        this.diagram.clear();
    }
}
