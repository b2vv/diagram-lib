// eslint-disable-next-line @typescript-eslint/naming-convention
interface Link {
    from: string;
    to: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface TreeNode {
    externalId: string;
    key?: string;
    extraData?: Record<string, any>;
    children: TreeNode[];
}

export class TreeAdapter {
    private mapNodes: Map<string, TreeNode> = new Map();

    public buildTreeFromLink(arrLinks: Link[]): TreeNode[] {
        arrLinks.forEach((link) => {
            const fromNode = this.getNode(link.from);
            const toNode = this.getNode(link.to);
            fromNode.children.push(toNode);
        });

        return this.getRootNodes();
    }

    public buildTreeFromLinkAndNode(arrLinks: Link[], nodes: TreeNode[]): TreeNode[] {
        // Initialize TreeNode map
        nodes.forEach((node) => {
            this.mapNodes.set(node.externalId, {
                externalId: node.externalId,
                key: node.externalId,
                extraData: node,
                children: []
            });
        });

        // Build relationships
        arrLinks.forEach((link) => {
            const fromNode = this.mapNodes.get(link.from);
            const toNode = this.mapNodes.get(link.to);

            if (fromNode && toNode) {
                fromNode.children.push(toNode);
            }
        });

        return this.getRootNodes();
    }

    private getNode(key: string): TreeNode {
        if (!this.mapNodes.has(key)) {
            this.mapNodes.set(key, {externalId: key, children: []});
        }
        return this.mapNodes.get(key)!;
    }

    private getRootNodes(): TreeNode[] {
        const childKeys = new Set<string>();

        this.mapNodes.forEach((node) => {
            node.children.forEach((child) => {
                childKeys.add(child.externalId);
            });
        });

        const rootNodes: TreeNode[] = [];
        this.mapNodes.forEach((node, key) => {
            if (!childKeys.has(key)) {
                rootNodes.push(node);
            }
        });

        return rootNodes;
    }
}
