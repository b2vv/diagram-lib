import React from 'react';
import {DataSet} from 'vis-data';
import {Timeline, TimelineOptions, Timeline as TimelineInstance} from 'vis-timeline/standalone';
import 'vis-timeline/styles/vis-timeline-graph2d.min.css';

// eslint-disable-next-line
// @ts-ignore
import FirstIcon from './icons/angles-left.svg?react';
// eslint-disable-next-line
// @ts-ignore
import PrevIcon from './icons/angle-left.svg?react';
// eslint-disable-next-line
// @ts-ignore
import NextIcon from './icons/angle-right.svg?react';
// eslint-disable-next-line
// @ts-ignore
import LastIcon from './icons/angles-right.svg?react';
// eslint-disable-next-line
// @ts-ignore
import ZoomPlusIcon from './icons/magnifying-glass-plus.svg?react';
// eslint-disable-next-line
// @ts-ignore
import ZoomMinusIcon from './icons/magnifying-glass-minus.svg?react';
import styles from './index.module.scss';

interface TimelineData {
    id: string;
    content: string;
    start: string;
    end: string;
    data: unknown;
}

interface ITimelineProps {
    data: TimelineData[];
    onSelect: (data?: TimelineData) => void;
}

export const TimelineComponent: React.FC<ITimelineProps> = React.memo((props) => {
    const timelineRef = React.useRef<HTMLDivElement>(null);
    const timelineInstance = React.useRef<TimelineInstance | null>(null);
    const [currentIndex, setCurrentIndex] = React.useState<number>(-1);
    const itemsFreeze = React.useRef<DataSet<TimelineData>>();

    const {onSelect} = props;

    const dataItems = React.useMemo(() => new DataSet(props.data), [props.data]);

    React.useLayoutEffect(() => {
        if (!itemsFreeze.current || (JSON.stringify(itemsFreeze.current) !== JSON.stringify(dataItems))) {
            itemsFreeze.current = dataItems;
        }
    }, [dataItems]);

    const selectHandler = React.useCallback((e: {items: string[]}) => {
        const index = itemsFreeze.current?.getIds().indexOf(e?.items?.[0]);
        setCurrentIndex(index ?? -1);
    }, []);

    React.useLayoutEffect(() => {
        if (!timelineInstance.current && !timelineRef.current) {
            const options: TimelineOptions = {
                width: '100%',
                height: '100%',
                stack: true,
                showCurrentTime: true,
                zoomMin: 1000 * 60 * 60 * 24 * 7, // 7 day in milliseconds
                zoomMax: 1000 * 60 * 60 * 24 * 365 * 25, // about 10 years in milliseconds
                horizontalScroll: true,
                zoomKey: 'ctrlKey' // Use 'ctrl' key for zooming
            };
            timelineInstance.current = new Timeline(timelineRef.current as unknown as HTMLDivElement, new DataSet(), options);
            timelineInstance.current?.zoomOut(100);
            timelineInstance.current?.on('select', selectHandler);
        }
    }, [selectHandler]);

    React.useLayoutEffect(() => {
        timelineInstance.current?.setData({
            items: dataItems
        });
    }, [dataItems]);

    const zoomIn = React.useCallback(() => {
        timelineInstance.current?.zoomIn(0.5);
    }, []);

    const zoomOut = React.useCallback(() => {
        timelineInstance.current?.zoomOut(0.5);
    }, []);

    const hasPrev = currentIndex > 0;
    const hastLast = currentIndex < (itemsFreeze.current?.length ?? 0);

    const jumpToItem = React.useCallback((itemId?: number) => {
        // If itemId undefined we deselect 
        timelineInstance.current?.setSelection(itemId as number, {focus: true, animation: {}});
    }, []);

    const firstItem = React.useCallback(() => {
        setCurrentIndex(0);
    }, []);

    const nextItem = React.useCallback(() => {
        setCurrentIndex((prev) => prev + 1);
    }, []);

    const prevItem = React.useCallback(() => {
        setCurrentIndex((prev) => prev - 1);
    }, []);

    const lastItem = React.useCallback(() => {
        const itemIds = itemsFreeze.current?.getIds() ?? [];
        setCurrentIndex(itemIds.length - 1);
    }, []);

    React.useLayoutEffect(() => {
        jumpToItem(itemsFreeze.current?.getIds()[currentIndex] as number);
        onSelect(itemsFreeze.current?.get()?.[currentIndex]);
    }, [currentIndex, jumpToItem, onSelect]);

    return (
        <div className={styles['time-line-wrap']}>
            <div className={styles['btn-group']}>
                <button className={styles.btn} onClick={zoomIn}><ZoomPlusIcon /></button>
                <button className={styles.btn} onClick={zoomOut}><ZoomMinusIcon /></button>
                <button disabled={!hasPrev} className={styles.btn} onClick={firstItem}><FirstIcon /></button>
                <button disabled={!hasPrev} className={styles.btn} onClick={prevItem}><PrevIcon /></button>
                <button disabled={!hastLast} className={styles.btn} onClick={nextItem}><NextIcon /></button>
                <button disabled={!hastLast} className={styles.btn} onClick={lastItem}><LastIcon /></button>
            </div>
            <div ref={timelineRef} className={`${styles['time-line']} ${styles['time-line--dark']}`} />
        </div>
    );
});

TimelineComponent.displayName = 'TimelineComponent';
