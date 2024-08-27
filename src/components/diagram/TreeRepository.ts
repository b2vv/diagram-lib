import {Node} from '../calc-diagram/tidy';
import {Disposable} from '../dispose';


type Transaction = (tree: Node) => void;

export class TreeRepository extends Disposable {
    private nodes: Map<number, Node> = new Map();
    private transaction!: Transaction;

    public addNode(node: Node, parentId?: number): void {
        if (parentId !== undefined) {
            const parentNode = this.nodes.get(parentId);
            if (parentNode) {
                parentNode.children.push(node);
                node.parentId = parentId;
            } else {
                throw new Error(`Parent node with ID ${parentId} not found`);
            }
        }
        this.nodes.set(node.id!, node);
        this.commit();
    }

    public removeNode(nodeId: number): Node | null {
        const node = this.nodes.get(nodeId);
        if (!node) {
            return null;
        }

        // Remove node from its parent's children if it has a parent
        if (node.parentId !== undefined) {
            const parentNode = this.nodes.get(node.parentId);
            if (parentNode) {
                parentNode.children = parentNode.children.filter((child) => child.id !== nodeId);
            }
        }

        // Remove all child nodes recursively
        this.removeChildren(node);

        // Finally, remove the node itself
        this.nodes.delete(nodeId);
        this.commit();
        return node;
    }

    private removeChildren(node: Node): void {
        node.children.forEach((child) => {
            this.nodes.delete(child.id!);
            this.removeChildren(child);
        });
        node.children = [];
    }

    public getChildren(nodeId: number): Node[] {
        const node = this.nodes.get(nodeId);
        return node ? node.children : [];
    }

    public removeLink(nodeId: number): Node | null {
        const node = this.nodes.get(nodeId);
        if (!node || node.parentId === undefined) {
            return null;
        }

        const parentNode = this.nodes.get(node.parentId);
        if (parentNode) {
            parentNode.children = parentNode.children.filter((child) => child.id !== nodeId);
        }
        this.commit();
        node.parentId = undefined;
        return node;
    }

    public initTree(rootNode: Node): void {
        const traverse = (node: Node, parentId?: number): void => {
            this.addNode(node, parentId);
            node.children.forEach((child) => traverse(child, node.id));
        };
        traverse(rootNode);
        this.commit();
    }

    public clear() {
        this.nodes.clear();
        this.commit();
    }

    private generateTree(nodes: Node[]): Node {
        // First, map all nodes by their IDs
        nodes.forEach((node) => {
            this.nodes.set(node.id!, {...node, children: []});
        });

        // Then, link child nodes to their parents
        nodes.forEach((node) => {
            if (node.parentId !== undefined && node.parentId !== null) {
                const parentNode = this.nodes.get(node.parentId);
                const currentNode = this.nodes.get(node.id!);
                if (parentNode && currentNode) {
                    parentNode.children.push(currentNode);
                }
            }
        });

        // Finally, collect and return root nodes (nodes without a parent)
        const rootNodes: Node[] = [];
        this.nodes.forEach((node) => {
            if (node.parentId === undefined || node.parentId === null) {
                rootNodes.push(node);
            }
        });

        return rootNodes[0];
    }

    private commit() {
        this.transaction(this.generateTree(Array.from(this.nodes.values())));
    }

    public setTransaction(transaction: Transaction): void {
        this.transaction = transaction;
    }
}
