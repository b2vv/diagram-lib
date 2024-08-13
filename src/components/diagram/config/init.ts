import go, {Diagram} from 'gojs';

import {Builder, ConfirmType, RenderedType, DragEvent, INodeData} from '../types';
import styleTheme from './style-theme';

interface Event {
    onConfirm?: ConfirmType;
    onRenderComplete?: RenderedType;
    onLinkChanged?: DragEvent;
}

export function initDiagram(id: string, $: Builder, event?: Event): Diagram {
    const diagram = $(go.Diagram, id, {
        'commandHandler.deleteSelection': () => event?.onConfirm?.(),
        maxSelectionCount: 1,
        initialScale: 1,
        initialContentAlignment: go.Spot.Center,
        // initialAutoScale: go.AutoScale.UniformToFill,
        initialLayoutCompleted: (e: go.DiagramEvent) => {
            e.diagram.nodes.each((node) => {
                console.log('Node render: ', node.data.name, node.data.key);
            });
            event?.onRenderComplete?.(false);
        },
        'linkingTool.isEnabled': false, // отключить стандартное связывание
        'linkingTool.direction': go.LinkingDirection.ForwardsOnly, // позволить связывание только вперед
        'dragSelectingTool.isEnabled': true, // включить выбор перетаскиванием
        'commandHandler.copiesTree': false, // отключить копирование поддеревьев
        'commandHandler.deletesTree': false // отключить удаление поддеревьев
    });

    diagram.addDiagramListener('SelectionMoved', dragNode);

    diagram.undoManager.isEnabled = false;
    diagram.themeManager.changesDivBackground = true;
    diagram.themeManager.set('light', styleTheme.lightTheme);
    diagram.themeManager.set('dark', styleTheme.darkTheme);

    function dragNode(e: go.DiagramEvent) {
        const mousePt = diagram.lastInput.documentPoint;
        const closestParent = findClosestParent(diagram, mousePt, e.subject);
        const nodeKeys: INodeData[] = [];
        if (closestParent) {
            e.subject.each((part: go.Part) => {
                if (part instanceof go.Node && closestParent && closestParent !== part) {
                    nodeKeys.push(part.data);
                }
            });

            event?.onLinkChanged?.(nodeKeys, closestParent.data);
        }
    }

    return diagram;
}

function findClosestParent(diagram: go.Diagram, point: go.Point, excludedParts: go.List<go.Part>): go.Node | null {
    let closestDistance = Infinity;
    let closestParent: go.Node | null = null;

    // Используем findObjectsNear для поиска ближайших объектов
    const nearbyObjects = diagram
        .findObjectsNear(point, 50, null, checkIsNode) as go.Set<go.GraphObject>;
    nearbyObjects.each((obj: go.GraphObject) => {
        const node = obj.part as go.Node;
        if (!excludedParts.contains(node)) {
            const distance = point.distanceSquaredPoint(node.location);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestParent = node;
            }
        }
    });

    return closestParent;
}

function checkIsNode(obj: go.GraphObject) {
    return obj.part instanceof go.Node;
}
