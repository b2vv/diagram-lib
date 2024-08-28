import go, {Diagram} from 'gojs/release/go-debug';

import {Builder, ConfirmType, RenderedType, DragEvent, INodeData} from '../types';
import styleTheme from './style-theme';

interface Event {
    onConfirm?: ConfirmType;
    onRenderComplete?: RenderedType;
    onLinkChanged?: DragEvent;
    setViewPortDimension?: any;
}

let isDragging = false;
let firstLoad = true;
let dim = [];


export function initDiagram(id: string, $: Builder, event?: Event): Diagram {
    const diagram = $(go.Diagram, id, {
        'commandHandler.deleteSelection': () => event?.onConfirm?.(),
        maxSelectionCount: 1,
        initialScale: 1,
        initialContentAlignment: go.Spot.Center,
        // initialAutoScale: go.AutoScale.UniformToFill,
        initialLayoutCompleted: (e: go.DiagramEvent) => {
            e.diagram.nodes.each((node) => {
                node.position = new go.Point(node.data.x - (node.data.width / 2), node.data.y);
            });
            if (firstLoad) {
                firstLoad = false;
                setViewPortDimension();
            }
            diagram.scrollToRect( new go.Rect(...dim));
        },
         'animationManager.isEnabled': false,
        'linkingTool.isEnabled': false, // отключить стандартное связывание
        'linkingTool.direction': go.LinkingDirection.ForwardsOnly, // позволить связывание только вперед
        'dragSelectingTool.isEnabled': true, // включить выбор перетаскиванием
        'commandHandler.copiesTree': false, // отключить копирование поддеревьев
        'commandHandler.deletesTree': false // отключить удаление поддеревьев
    });

    diagram.addDiagramListener('SelectionMoved', dragNode);

    window.diagram = diagram;


    const container = document.getElementById(id);

    // Handle mousedown event
    container.addEventListener('mousedown', (event) => {
        isDragging = true;
    });

    let timer: number = 0;
    container.addEventListener('mousemove', () => {
        if (isDragging) {
            clearTimeout(timer);
            timer = setTimeout(setViewPortDimension, 300);
        }
    });

    // Handle mouseup event

    container.addEventListener('mouseup', () => {
        isDragging = false;
    });

    function setViewPortDimension() {
        const viewportBounds = diagram.viewportBounds;

        const topX = viewportBounds.x;
        const topY = viewportBounds.y;
        const bottomX = viewportBounds.x + viewportBounds.width;
        const bottomY = viewportBounds.y + viewportBounds.height;

        dim = [
            viewportBounds.x,
            viewportBounds.y,
            viewportBounds.width,
            viewportBounds.height,
        ]

        event?.setViewPortDimension((prev) => {
            if (prev[0] === topX && prev[3] === bottomY) {
                return prev;
            }
            return [topX, topY, bottomX, bottomY];
        });
    }

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
