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

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface Node {
    id?: number;
    extraData: Record<string, any>;
    externalId?: string;
    width: number;
    height: number;
    parentId?: number;
    x: number;
    y: number;
    children: Node[];
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
    private root: InnerNode | undefined;
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
            if (node.id == null) {
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
                node.height = defWidth!;
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
}
