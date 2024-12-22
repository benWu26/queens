import { cellType, boardType, nodeLabelType} from "./types"
import { solvePuzzle } from "./BoardLogic";
import _ from "lodash";
import { Graph, json } from "graphlib";
import rfdc from "rfdc";
const clone = rfdc();
// PUZZLE GENERATION
// create graph of n^2 vertices, each vertex corresponds to a cell
// an edge between two vertices means that those two cells are connected by an edge
// cell merge algorithm:
// select an edge of the cell at random
// take the two nodes that edge connects to
// merge them into one node, combine their cellLists together


/**
 * Creates a graph of size n^2, with each node representing a cell on an n x n board.
 * Each node has a cellList of length 1, which is the index of the cell on the board.
 * Edges exist between all cells that are horizontally or vertically adjacent.
 * @param {number} size the side length of the board
 * @returns {Graph} the created graph
 */
const createGraph = (size: number): Graph => {
    const g = new Graph();

    // Iterate over each cell on the board and create a node for it
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const index = size * i + j;
            const nodeLabel: nodeLabelType = { cells: [index] }; // Each node has a cellList of length 1, which is the index of the cell on the board
            g.setNode(index.toString(), nodeLabel);
        }
    }

    // Iterate over each cell and add edges to any adjacent cells
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const index = size * i + j;

            // Add an edge below the current cell, if it exists
            if (i < size - 1) {
                g.setEdge(index.toString(), (index + size).toString());
            }

            // Add an edge to the right of the current cell, if it exists
            if (j < size - 1) {
                g.setEdge(index.toString(), (index + 1).toString());
            }
        }
    }

    return g;
}


/**
 * Merges two nodes in a graph, preserving the original node's edges and labels, and removing the other node.
 * This function is used in the puzzle generation algorithm.
 * @param {Graph} graph the graph to operate on
 * @param {string} stayNode the node to preserve
 * @param {string} elimNode the node to remove
 */
const mergeNodes = (graph: Graph, stayNode: string, elimNode: string): void =>  {
    if (!graph.hasNode(stayNode) || !graph.hasNode(elimNode)) {
      throw new Error('Both stayNode and elimNode must exist in the graph.');
    }
  
    // Remove the edge between stayNode and elimNode if it exists
    if (graph.hasEdge(stayNode, elimNode)) { // O(1)
      graph.removeEdge(stayNode, elimNode); // O(1)
    }

    // Add all of elimNode's cells to stayNode
    graph.node(stayNode).cells.push(...graph.node(elimNode).cells); // O(1)

    // Get all neighbors of elimNode
    const neighbors = graph.neighbors(elimNode) || []; // O(|V|)
  
    // Rewire edges and remove connections to elimNode
    for (const neighbor of neighbors) { // roughly O(1) iterations
      if (neighbor !== stayNode) {
        // Create a new edge between stayNode and elimNode's neighbors
        graph.setEdge(stayNode, neighbor); // O(1)
      }
    }
  
    // Remove elimNode from the graph
    graph.removeNode(elimNode); // O(E) time
}

// graph is relatively sparse, so O(V) and O(E) can be treated as identical;
// mergeNodes takes O(V) time, where V is at most n^2 and decreases over time.


/**
 * Takes a graph and reduces it down to n nodes, where n is the side length of the board.
 * This is done by repeatedly selecting a random edge and merging the two nodes it connects.
 * @param {Graph} graph the graph to color
 * @param {number} size the side length of the board
 * @returns {Graph} the colored graph
 */
const colorGraph = (graph: Graph, size: number): Graph => {
    // select random edge
    // merge those two nodes into one, reduce edges
    graph = json.read(json.write(graph));


    // Reduce the size of the graph until it has the desired size
    for (let i = 0; i < size**2 - size; i++) { // O(n^2) iterations
        const edge = _.sample(graph.edges()); // O(E)
        if (edge) {
            // merge the two nodes that this edge connects
            mergeNodes(graph, edge.v, edge.w); // O(E)
        }
    }

    return graph;
}

/**
 * Takes a graph and constructs a board from it. The board is a 2D array of cells, where each cell has a color and player status.
 * The color of the cell is determined by the index of the node in the graph that contains the cell's index in its cellList.
 * The player status of each cell is initially set to "valid".
 * @param {Graph} graph the graph to construct the board from
 * @returns {boardType} the constructed board
 */
const constructBoardFromGraph = (graph: Graph): boardType => {
    const size = graph.nodes().length;

    // Create a 2D array to store the color map
    const colorMap: number[][] = Array.from({ length: size }, () => Array(size).fill(0));

    // Iterate over each node in the graph and fill in the color map
    graph.nodes().forEach((node, nodeIdx) => {
        // Get the list of cells that this node contains
        const cells = graph.node(node).cells;

        // Iterate over the cells and fill in the color map
        cells.forEach((idx: number) => {
            const rowIdx = Math.floor(idx / size);
            const colIdx = idx % size;
            colorMap[rowIdx][colIdx] = nodeIdx;
        })
    })
    // Create the board by mapping the color map to cells
    const board: boardType = colorMap.map(row => row.map((c): cellType => {
        // Each cell has a color, player status, real status, and causes
        return {
            color: c,
            playerStatus: "valid",
            realStatus: "invalid",
            causes: []
        }
    }))

    return board;
}

/**
 * Generates a new board of a given size by first creating a graph with the given number of nodes,
 * then coloring the graph, and finally constructing a board from the colored graph.
 * @param {number} size the size of the board to generate
 * @returns {boardType} the generated board
 */
const generateOneBoard = (size: number): boardType => {
    // Create a graph with the given number of nodes
    const defaultGraph = createGraph(size);

    // Color the graph by repeatedly merging nodes until the graph has the desired number of nodes
    const coloredGraph = colorGraph(defaultGraph, size);

    // Construct a board from the colored graph
    const board = constructBoardFromGraph(coloredGraph);
    return board;
}

const generateValidBoard = (size: number): boardType => {
    while(true) {
        const puzzleBoard = generateOneBoard(size);
        if (solvePuzzle(clone(puzzleBoard)).length === 1){
            return puzzleBoard;
        }
    }
}

export {generateValidBoard}


// possible optimizations:
// optimize the puzzle solver to be rule-based instead of backtracking, 