import {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';

import {TreeAdapter} from './components/TreeAdapter';
import {TreeRepository} from './components/diagram/TreeRepository';
import {DiagramComponent, ILinkData, useDiagram} from './components';
import {DocumentDimension, Node, TidyLayout} from './components/calc-diagram/tidy';
import {getLayoutType} from "./components/calc-diagram/consts";

const WIDTH = 250;
const HEIGHT = 100;
const LEVEL_GAP = 20;
const NODE_GAP = 120;

function App() {
    const {
        diagramRef,
        goToNodeByKey,
        saveNodeTransaction,
        removeTransaction,
        moveNodesTransaction,
    } = useDiagram();

    const [isRenderComplete, setRenderComplete] = useState(false);
    const adapter = useMemo(() => new TreeAdapter(), []);
    const [links, setLinks] = useState<ILinkData[]>();
    const [nodes, setNodes] = useState<Node>();

    const repTree = useMemo(() => new TreeRepository(), []);
    const repSuspendTree = useMemo(() => new TreeRepository(), []);
    const view = useRef<HTMLDivElement>();

    const [tree, setTree] = useState<Node>();
    const [suspendedTree, setSuspendedTree] = useState<Node>();
    const [documentDimension, setDocumentDimension] = useState<DocumentDimension>([0,0,0,0]);
    const [viewPortDimension, setViewPortDimension] = useState<DocumentDimension>([0,0,0,0]);

    const layoutRef = useRef<TidyLayout>();
    const type = getLayoutType();

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

    const filterNode = useCallback((viewPort: DocumentDimension) => {
        if (viewPort.filter(Boolean).length) {
            viewPort[0] -= WIDTH * 5;
            viewPort[2] += WIDTH * 5;
            viewPort[1] -= HEIGHT * 5;
            viewPort[3] += HEIGHT * 5;

            setNodes(layoutRef.current?.getNodesByView(viewPort) ?? []);

            const links = layoutRef.current?.getLinesByView?.(viewPort) ?? [];

            // I DON'T KNOW why goJS needs an offset for the X axis
            const shift = WIDTH/4 - 21;
            const l  = links.map((link) => ({
                from: link.from,
                to: link.to,
                points: new go.List().addAll([
                    new go.Point(link.coord.x1 + shift, link.coord.y1),
                    new go.Point(link.coord.cpx1+ shift, link.coord.cpy1),
                    new go.Point(link.coord.cpx2+ shift, link.coord.cpy2),
                    new go.Point(link.coord.x2+ shift, link.coord.y2),
                ])
            }));
            setLinks(l);
        }
    }, [repTree])

    const initData = useCallback(() => {
        layoutRef.current!.recalculateX();
        const size = layoutRef.current!.getSize();
        size[2] += 2 * WIDTH;
        size[3] += 2 * HEIGHT;
        setDocumentDimension(size);
        filterNode([0, 0, view.current?.clientWidth, view.current?.clientHeight]);
    }, []);

    useLayoutEffect(() => {
        if (!layoutRef.current) {
            return;
        }

        layoutRef.current.changeLayoutType(type);
        layoutRef.current.layout(true);
        initData();
    }, [type]);

    useLayoutEffect(() => {
        let done = false;
        const func = async () => {
            layoutRef.current = await TidyLayout.create(type, LEVEL_GAP, NODE_GAP);
            if (done) {
                return;
            }

            layoutRef.current.set_root(tree, WIDTH, HEIGHT);
            layoutRef.current.layout();
            initData();
            console.log('BUILD')
        };

        func();
        return () => {
            done = true;
            layoutRef.current?.dispose();
            layoutRef.current = undefined;
        };
    }, [tree]);

    useEffect(() => {
        if (isRenderComplete) {
            return;
        }
        filterNode(viewPortDimension);
    }, [viewPortDimension, filterNode, isRenderComplete]);

    return (
        <div style={{width: '100vw', height: '100vh'}} ref={view}>
            {<DiagramComponent
                onRenderComplete={setRenderComplete}
                setViewPortDimension={setViewPortDimension}
                linkArr={links}
                nodeArr={nodes}
                diagramRef={diagramRef}
                documentSize={documentDimension}
            />
            }
        </div>
    );
}

export default App;
