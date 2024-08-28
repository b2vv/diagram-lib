import go from 'gojs';
import {MutableRefObject} from 'react';

import {DEF_IMG, findHeadShot, findLevelColor} from './helper';
import {Builder, ButtonEvent, ButtonsKey, NodeDiagram} from '../types';
import {configButton, iconsButtons} from '../consts';
import {IRefType} from '../useDiagram';

function changeOpacityButtons(node: NodeDiagram, buttonNames: ButtonsKey[], opacity: number) {
    buttonNames
        .forEach((name) => {
            const button = (node as NodeDiagram).findObject(`BUTTON-${name}`);
            if (button) {
                button.opacity = opacity;
            }
        });
    const button = (node as NodeDiagram).findObject('BUTTONX');
    if (button) {
        button.opacity = opacity;
    }
}

export const getNodeTemplate = ($: Builder, setNode: (node: go.Node) => void, buttons: ButtonEvent) => {
    const existKeys = iconsButtons.filter((name) => buttons[name]);

    return (
        new go.Node(go.Panel.Spot, {
            isShadowed: true,
            shadowOffset: new go.Point(0, 2),
            selectionObjectName: 'BODY',
            mouseEnter: (_e, nodeCurr) => {
                changeOpacityButtons(nodeCurr as NodeDiagram, existKeys, 1);
            },
            mouseLeave: (_e, nodeCurr) => {
                changeOpacityButtons(nodeCurr as NodeDiagram, existKeys, 0);
            }
        })
            .add(
                new go.Panel(go.Panel.Auto, {name: 'BODY'}).add(
                    // define the node's outer shape
                    new go.Shape('RoundedRectangle',
                        {name: 'SHAPE', strokeWidth: 0, portId: '', spot1: go.Spot.TopLeft, spot2: go.Spot.BottomRight})
                        .theme('fill', 'background'),
                    new go.Panel(go.Panel.Table, {margin: 0.5, defaultRowSeparatorStrokeWidth: 0.5})
                        .theme('defaultRowSeparatorStroke', 'divider')
                        .add(
                            new go.Panel(go.Panel.Table, {padding: new go.Margin(18, 18, 18, 24)})
                                .addColumnDefinition(0, {width: 240})
                                .add(
                                    new go.Panel(go.Panel.Table, {
                                        column: 0,
                                        alignment: go.Spot.Left,
                                        stretch: go.Stretch.Vertical,
                                        defaultAlignment: go.Spot.Left
                                    })
                                        .add(
                                            new go.Panel(go.Panel.Horizontal, {row: 0})
                                                .add(
                                                    new go.TextBlock({editable: false, minSize: new go.Size(10, 14)})
                                                        .bind(new go.Binding('text', 'extraData', function(extra) {
                                                            return extra.name; // Отримуємо значення для відображення
                                                        })
                                                        .makeTwoWay(function(text, data) {
                                                            return text;
                                                        }))
                                                        // .bindTwoWay('text', 'name')
                                                        .theme('stroke', 'text')
                                                        .theme('font', 'name')
                                                ),
                                            new go.TextBlock({row: 1, editable: false, minSize: new go.Size(10, 14)})
                                                .bindTwoWay('text', 'description')
                                                .theme('stroke', 'subtext')
                                                .theme('font', 'normal')
                                        ),
                                    new go.Panel(go.Panel.Spot, {isClipping: true, column: 1}).add(
                                        new go.Shape('Circle', {desiredSize: new go.Size(50, 50), strokeWidth: 0}),
                                        new go.Picture({name: 'PICTURE', source: DEF_IMG, desiredSize: new go.Size(50, 50)})
                                            .bind('source', 'img', findHeadShot)
                                    )
                                )
                        )
                ),  // end Auto Panel
                new go.Shape('RoundedLeftRectangle', {
                    alignment: go.Spot.Left, alignmentFocus: go.Spot.Left,
                    stretch: go.Stretch.Vertical, width: 6, strokeWidth: 0
                })
                    .themeObject('fill', '', 'levels', findLevelColor),
                ...existKeys.map((name) => $('Button',
                    $(go.Picture, {source: configButton[name].icon, width: 20, height: 20}),
                    {
                        name: `BUTTON-${name}`,
                        alignment: configButton[name].position,
                        opacity: 0,  // initially not visible
                        click: (_e, button) => {
                            if (button.part) {
                                setNode(button.part as NodeDiagram)
                                buttons[name]?.(button.part.data);
                            }
                        }
                    },
                    // button is visible either when node is selected or on mouse-over
                    new go.Binding('opacity', 'isSelected', (s) => s ? 1 : 0).ofObject()
                )),
                $('TreeExpanderButton',
                    {
                        _treeExpandedFigure: 'LineUp', _treeCollapsedFigure: 'LineDown',
                        name: 'BUTTONX', alignment: go.Spot.Bottom, opacity: 0  // initially not visible
                    },
                    // button is visible either when node is selected or on mouse-over
                    new go.Binding('opacity', 'isSelected', (s) => s ? 1 : 0).ofObject()
                )
            )
            .theme('shadowColor', 'shadow')
            // for sorting, have the Node.text be the data.name
            .bind('text', 'name')
            // bind the Part.layerName to control the Node's layer depending on whether it isSelected
            .bindObject('layerName', 'isSelected', (sel) => sel ? 'Foreground' : '')
            .bindTwoWay('isTreeExpanded')
    );
};
