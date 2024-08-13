import go from 'gojs';

import {Builder} from '../types';

export const getLayout = ($: Builder) => (
    $(go.TreeLayout, {
        treeStyle: go.TreeStyle.LastParents,
        arrangement: go.TreeArrangement.Horizontal,

        angle: 90,
        layerSpacing: 35,

        alternateAngle: 90,
        alternateLayerSpacing: 35,
        alternateAlignment: go.TreeAlignment.Bus,
        alternateNodeSpacing: 20
    })
);
