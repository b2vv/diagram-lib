import './App.css';
import {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {GraphObject} from 'gojs';

import {Timeline} from './timeline/timeline.tsx';
import {TreeAdapter} from './components/TreeAdapter';
import {TreeRepository} from './components/diagram/TreeRepository';
import {Render} from './components/diagram/Render';
import {DiagramComponent, ILinkData} from './components';
import {Node} from './components/calc-diagram/tidy';

function App() {
    const adapter = useMemo(() => new TreeAdapter(), []);
    const [links, setLinks] = useState<ILinkData[]>();
    const [nodes, setNodes] = useState<Node>();

    const repTree = useMemo(() => new TreeRepository(), []);
    const repSuspendTree = useMemo(() => new TreeRepository(), []);

    const [tree, setTree] = useState<Node>();
    const [suspendedTree, setSuspendedTree] = useState<Node>();

    useEffect(() => {
        fetch('http://localhost:3000/').then((res) => res.json()).then((data) => {
            const linksData = data.structureNodes.flatMap((link) =>
                link.subordinateOrganizationIds.map((child) => ({
                    from: link.leadOrganizationId,
                    to: child
                }))
            );

            const organizationsData = data.organizations.map((item) => ({
                key: item.externalId,
                ...item
            }));

            setLinks(linksData);

            const [treeG, ...suspendedTreeG] = adapter.buildTreeFromLinkAndNode(linksData, organizationsData);

            repTree.setTransaction(setTree);
            repSuspendTree.setTransaction(setSuspendedTree);

            repTree.initTree(treeG as Node);
            repSuspendTree.initTree({
                externalId: 'suspend'
            } as Node);
            suspendedTreeG.forEach((tr) => {
                repSuspendTree.addNode(tr as Node);
            });
        });
    }, [adapter, repSuspendTree, repTree]);
    return (
        <>
            <DiagramComponent ref={ref} />
        </>
    );
}

export default App;
