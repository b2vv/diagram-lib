import React, {
    FC,
    memo,
    PropsWithChildren
    useId, useLayoutEffect, useRef,
} from 'react';

export const DiagramComponent: FC<PropsWithChildren<unknown>> = memo((props, ref) => {
    const elementID = useId();
    const containerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!layoutRef.current || !renderRef.current) {
            return;
        }
        layoutRef.current.changeLayoutType(type);
        layoutRef.current.layout(true);
    }, [type]);

    return (
        <>
            <div className={styles['gojs-wrapper-div']}>
                <div id={elementID} ref={containerRef} className={styles['diagram-component']} />
            </div>
            {props.children}
        </>
    );
});

DiagramComponent.displayName = 'DiagramComponent';
