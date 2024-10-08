import go from 'gojs';

import {Builder} from '../types';

export const getLinkTemplate = ($: Builder) => (
    $(go.Link,
        {
            routing: go.Routing.AvoidsNodes,
            layerName: 'Background',
            corner: 5,
            curve: go.Curve.JumpOver,
            toShortLength: 4
        },
        new go.Binding("points").makeTwoWay(),
        $(go.Shape, {strokeWidth: 2},
            new go.ThemeBinding('stroke', 'link')
        ))
);
