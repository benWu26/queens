import { Graph } from "graphlib";
import { nodeLabelType } from "./types";

// Extend the Graph class to enforce NodeLabelType for node labels
class CustomGraph extends Graph {
    constructor() {
        super({ directed: false });
    }

    setNode(node: string, label: nodeLabelType): CustomGraph{
        return super.setNode(node, label) as CustomGraph;
    }

    node(node: string): nodeLabelType {
        return super.node(node) as nodeLabelType;
    }
}

export default CustomGraph;