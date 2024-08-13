import {useCallback, useRef} from 'react';
import go from 'gojs';

import {
    Diagram,
    NodeDiagram,
    Part,
    GraphLinksModel,
    INodeData,
    DragEvent
} from './types';

export interface IRefType {
    diagram: Diagram | null;
    currentNode: NodeDiagram;
}

export function useDiagram() {
    const diagramRef = useRef<IRefType>({
        diagram: null
    } as IRefType);

    const moveToNode = useCallback((node?: NodeDiagram | null) => {
        if (node && diagramRef.current?.diagram) {
            diagramRef.current.diagram.commandHandler.scrollToPart(node as Part);
            diagramRef.current.diagram.select(node as Part);
        }
    }, []);

    const goToNodeByKey = useCallback((nodeKey: string) => {
        const node = diagramRef.current?.diagram?.findNodeForKey(nodeKey) as NodeDiagram;
        moveToNode(node);
    }, [moveToNode]);

    const saveNodeTransaction = useCallback((data: INodeData) => {
        if (!diagramRef.current.diagram) {
            return;
        }

        const diagram = diagramRef.current.diagram;
        diagram.model.commit((m) => {
            if (!data.key) {
                m.addNodeData(data);
                const newNode = diagram.findNodeForData(data);
                if (newNode) {
                    newNode.location = diagramRef.current.currentNode.location;
                    const model = diagram.model as unknown as GraphLinksModel;
                    model.addLinkData({from: diagramRef.current.currentNode.data.key, to: newNode.data.key});
                }
            } else {
                const node = diagram.model.findNodeDataForKey(data.key);
                for (const dataKey in data) {
                    if (data.hasOwnProperty(dataKey) && node) {
                        m.set(node, dataKey, data[dataKey]);
                    }
                }
            }
        }, `${!data.key ? 'add' : 'edit'} organization`);
    }, []);

    const removeTransaction = useCallback(() => {
        if (!diagramRef.current.diagram) {
            return;
        }

        const diagram = diagramRef.current.diagram;

        diagram.startTransaction('deleteSelection');
        if (diagram.selection) {
            diagram.selection?.each((part) => {
                if (part instanceof go.Node) {
                    console.log(`Node ${part.key} will be deleted`);
                    // Ваши действия перед удалением узла
                } else if (part instanceof go.Link) {
                    console.log(`Link from ${part.fromNode?.key} to ${part.toNode?.key} will be deleted`);
                    // Ваши действия перед удалением связи
                }
                diagram.remove(part);
            });
        } else {
            console.log(`Node ${diagramRef.current.currentNode.key} will be deleted`);
            diagram.remove(diagramRef.current.currentNode);
        }

        diagram.commitTransaction('deleteSelection');
    }, []);

    const moveNodesTransaction = useCallback<DragEvent>((nodes, parent) => {
        if (!diagramRef.current.diagram) {
            return;
        }

        const diagram = diagramRef.current.diagram;
        const model = diagram.model as unknown as go.GraphLinksModel;
        const searchParent = diagram.findNodeForKey(parent.key) as unknown as go.Node;
        nodes.forEach((node) => {
            model.linkDataArray.slice().forEach((linkData) => {
                if (linkData.to === node.key) {
                    model.removeLinkData(linkData);
                }
            });
            model.addLinkData({from: parent.key, to: node.key});
            const searchNode = diagram.findNodeForKey(node.key) as unknown as go.Node;
            moveNodeToParent(diagram, searchNode, searchParent);
        });
    }, []);

    return {
        diagramRef,
        goToNodeByKey,
        saveNodeTransaction,
        removeTransaction,
        moveNodesTransaction
    };
}

function moveNodeToParent(diagram: go.Diagram, node: go.Node, parent: go.Node) {
    const parentLocation = parent.location.copy();
    const parentWidth = parent.actualBounds.width;
    const spacing = 10;
    const model = diagram.model as unknown as go.GraphLinksModel;

    const siblings: go.Node[] = [];
    diagram.nodes.each((n: go.Node) => {
        const links = model.linkDataArray as any[];
        if (links.some((link) => link.from === parent.data.key && link.to === n.data.key)) {
            siblings.push(n);
        }
    });

    if (siblings.length === 1) {
        const newLocation = parentLocation.copy();
        newLocation.offset(0, 50);
        node.move(newLocation);
    } else {
        const index = siblings.indexOf(node);
        const row = Math.floor(index / 2);
        const col = index % 2;

        const xOffset = col === 0 ? -parentWidth / 4 - spacing : parentWidth / 4 + spacing;
        const yOffset = row * 70 + 50;

        const newLocation = parentLocation.copy();
        newLocation.offset(xOffset, yOffset);
        node.move(newLocation);
    }
}
