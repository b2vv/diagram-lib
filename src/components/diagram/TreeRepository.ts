import {Node} from '../calc-diagram/tidy';
import {Disposable} from '../dispose';


type Transaction = (tree: Node) => void;

export class TreeRepository extends Disposable {
    private nodes: Map<string, Node> = new Map();
    private transaction!: Transaction;

    public addNode(node: Node, parentExId?: string): void {
        if (parentExId !== undefined) {
            const parentNode = this.nodes.get(parentExId);
            if (parentNode) {
                parentNode.children.push(node);
                node.parentExId = parentExId;
            } else {
                throw new Error(`Parent node with ID ${parentExId} not found`);
            }
        }
        this.nodes.set(node.externalId!, node);
        this.commit();
    }

    public removeNode(nodeId: string): Node | null {
        const node = this.nodes.get(nodeId);
        if (!node) {
            return null;
        }

        // Remove node from its parent's children if it has a parent
        if (node.parentExId !== undefined) {
            const parentNode = this.nodes.get(node.parentExId);
            if (parentNode) {
                parentNode.children = parentNode.children.filter((child) => child.externalId !== nodeId);
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
        node.children?.forEach((child) => {
            this.nodes.delete(child.externalId!);
            this.removeChildren(child);
        });
        node.children = [];
    }

    public getChildren(nodeId: string): Node[] {
        const node = this.nodes.get(nodeId);
        return node ? node.children : [];
    }

    public removeLink(nodeId: string): Node | null {
        const node = this.nodes.get(nodeId);
        if (!node || node.parentExId === undefined) {
            return null;
        }

        const parentNode = this.nodes.get(node.parentExId);
        if (parentNode) {
            parentNode.children = parentNode.children.filter((child) => child.externalId !== nodeId);
        }
        this.commit();
        node.parentExId = undefined;
        return node;
    }

    public initTree(rootNode: Node): void {
        const traverse = (node: Node, parentExId?: string): void => {
            this.addNode(node, parentExId);
            node.children?.forEach((child) => traverse(child, node.externalId));
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
            this.nodes.set(node.externalId!, {...node, children: []});
        });

        // Then, link child nodes to their parents
        nodes.forEach((node) => {
            if (node.parentExId !== undefined && node.parentExId !== null) {
                const parentNode = this.nodes.get(node.parentExId);
                const currentNode = this.nodes.get(node.externalId!);
                if (parentNode && currentNode) {
                    parentNode.children.push(currentNode);
                }
            }
        });

        // Finally, collect and return root nodes (nodes without a parent)
        const rootNodes: Node[] = [];
        this.nodes.forEach((node) => {
            if (node.parentExId === undefined || node.parentExId === null) {
                rootNodes.push(node);
            }
        });

        return rootNodes[0];
    }

    public commit() {
        this.transaction(this.generateTree(Array.from(this.nodes.values())));
    }

    public setTransaction(transaction: Transaction): void {
        this.transaction = transaction;
    }
}
