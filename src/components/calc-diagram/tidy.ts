import _initWasm, {
    InitInput,
    InitOutput,
    Tidy,
    Tidy as TidyWasm,
    WasmLayoutType as LayoutType
} from '../../../wasm_dist/wasm';
import {Disposable} from '../dispose';
import {visit} from './utils';

export {LayoutType};

let promise: Promise<InitOutput> | undefined;

export function initWasm(
    module_or_path?: InitInput | Promise<InitInput> // eslint-disable-line camelcase
): Promise<InitOutput> {
    if (!promise) {
        promise = _initWasm(module_or_path);
    }

    return promise;
}

interface BezierCurveShape {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    cpx1: number;
    cpy1: number;
    cpx2: number;
    cpy2: number;
}

export type DocumentDimension = [topX: number, topY: number, bottomY: number, bottomY: number];

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface Node {
    id?: number;
    extraData: Record<string, any>;
    externalId?: string;
    width: number;
    height: number;
    parentId?: number;
    parentExId?: string;
    x: number;
    y: number;
    children: Node[];
}

interface Line {
    from: string;
    to: string;
    coord: BezierCurveShape;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface InnerNode {
    id: number;
    width: number;
    height: number;
    parentId?: number;
    x: number;
    y: number;
    children: InnerNode[];
}

let nullId = -1;
const NULL_ID = () => {
    if (nullId === -1) {
        nullId = Tidy.null_id();
    }
    return nullId;
};

export class TidyLayout extends Disposable {
    private tidy: TidyWasm;
    private nextId = 1;
    public root: InnerNode | undefined;
    private idToNode: Map<number, InnerNode> = new Map();

    public static async create(
        type: LayoutType = LayoutType.Tidy,
        parent_child_margin = 40, // eslint-disable-line camelcase
        peer_margin = 10 // eslint-disable-line camelcase
    ) {
        await initWasm();
        return new TidyLayout(type, parent_child_margin, peer_margin);
    }

    private constructor(
        type: LayoutType = LayoutType.Tidy,
        parent_child_margin: number, // eslint-disable-line camelcase
        peer_margin: number // eslint-disable-line camelcase
    ) {
        super();
        if (type === LayoutType.Basic) {
            this.tidy = TidyWasm.with_basic_layout(parent_child_margin, peer_margin);
        } else if (type === LayoutType.Tidy) {
            this.tidy = TidyWasm.with_tidy_layout(parent_child_margin, peer_margin);
        } else if (type === LayoutType.LayeredTidy) {
            this.tidy = TidyWasm.with_layered_tidy(parent_child_margin, peer_margin);
        } else {
            throw new Error('not implemented');
        }
        this._register({
            dispose: () => {
                this.tidy.free();
            }
        });
    }

    public changeLayoutType(type: LayoutType) {
        this.tidy.change_layout(type);
    }

    public layout(updated = false) {
        if (updated) {
            this.update();
        }

        this.tidy.layout();
        const positions = this.tidy.get_pos();
        for (let i = 0; i < positions.length; i += 3) {
            const id = positions[i] | 0;
            const node = this.idToNode.get(id)!;
            node.x = positions[i + 1];
            node.y = positions[i + 2];
        }
    }

    public recalculateX() {
        this.adjustXByMin();
    }

    public getSize(): DocumentDimension {
        const bottomX = this.findMaxCoord('x');
        const bottomY = this.findMaxCoord('y');

        return [0, 0, bottomX, bottomY]
    }

    private findMinCoord(key: 'x' | 'y' = 'x'): number {
        let min: number | undefined = undefined;

        this.idToNode.forEach(node => {
            if (min === undefined || node[key] < min) {
                min = node[key];
            }
        });
        return min !== undefined ? min : 0;
    }

    private findMaxCoord(key: 'x' | 'y' = 'x'): number {
        let max: number | undefined = undefined;

        this.idToNode.forEach(node => {
            if (max === undefined || node[key] > max) {
                max = node[key];
            }
        });

        return max !== undefined ? max : 0;
    }

    private adjustXByMin(): void {
        const minX = Math.abs(this.findMinCoord());

        this.idToNode.forEach(node => {
            node.x = node.x + minX + node.width;
        });
    }

    public update() {
        const removedNodeId = new Set(this.idToNode.keys());
        visit(this.root!, (node) => {
            removedNodeId.delete(node.id);
            if (this.idToNode.has(node.id)) {
                return;
            }

            this.idToNode.set(node.id, node);
            this.tidy.add_node(
                node.id,
                node.width,
                node.height,
                node.parentId ?? NULL_ID()
            );
        });

        for (const nodeId of removedNodeId) {
            this.tidy.remove_node(nodeId);
            this.idToNode.delete(nodeId);
        }
    }

    // eslint-disable-next-line camelcase
    public set_root(root: Node, defWidth?: number, defHeight?: number): InnerNode {
        // TODO: Free old nodes
        const stack = [root];
        const ids: number[] = [];
        const width: number[] = [];
        const height: number[] = [];
        const parents: number[] = [];
        while (stack.length) {
            const node = stack.pop()!;
            if (!node) {
                continue;
            }
            if (typeof node?.id === undefined || node?.id == null) {
                node.id = this.nextId++;
            }

            ids.push(node.id!);
            if (!node.width && !defWidth) {
                throw Error('Set width');
            }
            if (!node.height && !defHeight) {
                throw Error('Set width');
            }

            if (!node.width) {
                node.width = defWidth!;
            }

            if (!node.height) {
                node.height = defHeight!;
            }

            width.push(node.width);
            height.push(node.height);
            parents.push(node.parentId ?? NULL_ID());
            this.idToNode.set(node.id!, node as InnerNode);
            for (const child of node.children.concat().reverse()) {
                if (child.parentId == null) {
                    child.parentId = node.id;
                }

                stack.push(child);
            }
        }

        this.root = root as InnerNode;
        this.tidy.data(
            new Uint32Array(ids),
            new Float64Array(width),
            new Float64Array(height),
            new Uint32Array(parents)
        );

        return this.root;
    }

    public getLines(): Line[] {
        return buildLine(this.root);
    }

    public getLinesByView(viewPort: DocumentDimension): Line[] {
        return buildLine(this.root, [], viewPort);
    }

    public getNodes() {
        return Array.from(this.idToNode.values());
    }

    public getNodesByView(viewPort: DocumentDimension) {
        const [topX, topY, bottomX, bottomY] = viewPort;
        const arr = [];

        for (const idToNodeElement of this.idToNode) {
            const [,item] = idToNodeElement;
            const cond =
                item.x > topX &&
                item.x < bottomX &&
                item.y > topY &&
                item.y < bottomY;
                if (cond) {
                    arr.push(item);
                }
        }
        return arr
    }
}

function buildLine(parent: InnerNode, lines: Line[] = [], viewPort?: DocumentDimension): Line[] {
    for (const child of parent?.children ?? []) {
        const coord = getBezierCurveShape(parent, child);
        if (!viewPort) {
            lines.push({
                from: parent.externalId,
                to: child.externalId,
                coord,
            });
        } else if (isInCube(coord, viewPort)) {

            lines.push({
                from: (parent as any).externalId,
                to: (child as any).externalId,
                coord,
            });
        }
        // Рекурсивний виклик для обходу дитини
        buildLine(child, lines, viewPort);
    }

    return lines;
}

function isInCube(line: BezierCurveShape, viewPort: DocumentDimension): boolean {
    if (isPointInCube(line.x1, line.y1, viewPort)) {
        return true;
    }
    if (isPointInCube(line.cpx1, line.cpy1, viewPort)) {
        return true;
    }
    if (isPointInCube(line.cpx2, line.cpy2, viewPort)) {
        return true;
    }
    if (isPointInCube(line.x2, line.y2, viewPort)) {
        return true;
    }

    if (crossLine(line.cpx1, line.cpy1, line.cpx2, line.cpy2, viewPort) || crossLine(line.cpx2, line.cpy2, line.cpx1, line.cpy1,  viewPort)) {
        return true;
    }

    return false;
}

function crossLine(x1: number, y1: number, x2: number, y2: number, viewPort: DocumentDimension): boolean {
    const [topX, topY, bottomX, bottomY] = viewPort;
    return x1 < topX && x2 > bottomX && y1 > topY && y2 < bottomY;

}

function isPointInCube(x: number, y: number, viewPort: DocumentDimension): boolean {
    const [topX, topY, bottomX, bottomY] = viewPort;

    return x > topX && y > topY && bottomX > x && bottomY > y;
}

function getBezierCurveShape(
    parent: InnerNode,
    child: InnerNode,
): BezierCurveShape {
    return {
        x1: parent.x,
        y1: parent.y + parent.height,
        x2: child.x,
        y2: child.y,
        cpx1: parent.x,
        cpy1: (child.y + parent.y + parent.height) / 2,
        cpx2: child.x,
        cpy2: (child.y + parent.y + parent.height) / 2,
    };
}
