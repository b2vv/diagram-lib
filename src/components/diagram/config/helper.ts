// this is used to determine feedback during drags
import go from 'gojs';

export const DEF_IMG = '/vite.svg';

export function mayWorkFor(node1: go.Node|go.Part, node2: go.Node) {
    if (!(node1 instanceof go.Node)) {return false;}  // must be a Node
    if (node1 === node2) {return false;}  // cannot work for yourself
    if (node2.isInTreeOf(node1)) {return false;}  // cannot work for someone who works for you
    return true;
}

// This converter is used by the Picture.
export function findHeadShot(pic?: string) {
    if (!pic) {return DEF_IMG;} // There are only 16 images on the server
    return pic;
}

// Used to convert the node's tree level into a theme color
export function findLevelColor(node: go.Node) {
    return node.findTreeLevel();
}

export function addEmployee(myDiagram: go.Diagram, node: go.Node) {
    if (!node) {return;}
    const thisemp = node.data;
    let newnode;
    myDiagram.model.commit((m) => {
        const newemp = {name: '(New person)', title: '(Title)', dept: thisemp.dept, parent: thisemp.key};
        m.addNodeData(newemp);
        newnode = myDiagram.findNodeForData(newemp);
        // set location so new node doesn't animate in from top left
        if (newnode) {newnode.location = node.location;}
    }, 'add employee');
    myDiagram.commandHandler.scrollToPart(newnode);
}

// Gets the text for a tooltip based on the adorned object's name
// export function toolTipTextConverter(obj) {
//     if (obj.name === 'EMAIL') {return obj.part.data.email;}
//     if (obj.name === 'PHONE') {return obj.part.data.phone;}
// }

// Align the tooltip based on the adorned object's viewport bounds
// export function toolTipAlignConverter(obj, tt) {
//     const d = obj.diagram;
//     const bot = obj.getDocumentPoint(go.Spot.Bottom);
//     const viewPt = d.transformDocToView(bot).offset(0, 35);
//     // if tooltip would be below viewport, show above instead
//     const align = d.viewportBounds.height >= viewPt.y / d.scale ?
//         new go.Spot(0.5, 1, 0, 6) : new go.Spot(0.5, 0, 0, -6);
//
//     tt.alignment = align;
//     tt.alignmentFocus = align.y === 1 ? go.Spot.Top : go.Spot.Bottom;
// }
