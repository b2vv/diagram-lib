import {useLayoutEffect, useMemo, useRef, useState} from 'react';
import {Renderer} from 'react-dom';

import {DiagramComponent} from './diagram.component';
import {getLayoutType, LayoutTypeStr} from '../calc-diagram/consts';
import {TidyLayout} from '../calc-diagram/tidy';
import {TreeRepository} from './TreeRepository';
import {Render} from './Render';
import {TreeAdapter} from '../TreeAdapter';
import {ILinkData} from './types';
import {Node} from '../calc-diagram/tidy';

export function useDiagram(layoutType?: LayoutTypeStr) {
    const ref = useRef<HTMLDivElement>(null);
    const renderRef = useRef<Render>();
    const containerRef = useRef<HTMLDivElement>(null);

    const layoutRef = useRef<TidyLayout>();
    const type = getLayoutType(layoutType);

    useLayoutEffect(() => {
        if (!layoutRef.current || !renderRef.current) {
            return;
        }
        layoutRef.current.changeLayoutType(type);
        layoutRef.current.layout(true);
    }, [type]);

    useLayoutEffect(() => {
        const [tree, ...suspendedTree] = adapter.buildTree(linksData);
    }, []);

    useLayoutEffect(() => {
        let done = false;
        const func = async () => {
            renderRef.current = new Render();
            layoutRef.current = await TidyLayout.create(type);
            repositoryRef.current = new TreeRepository();
            if (done) {
                return;
            }

            const innerRoot = layoutRef.current.set_root(root);
            layoutRef.current.layout();
            renderRef.current.updateData(innerRoot);
        };

        func();
        return () => {
            done = true;
            layoutRef.current?.dispose();
            layoutRef.current = undefined;
            renderRef.current?.clear();
        };
    }, [root]);

    useEffect(() => () => {
        renderRef.current?.dispose();
        renderRef.current = undefined;
    }, []);

    function Diagram() {
        return <DiagramComponent ref={containerRef} />;
    }
}
