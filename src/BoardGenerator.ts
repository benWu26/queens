import { cellType, boardType, nodeLabelType} from "./types"
import { solvePuzzle } from "./BoardLogic";
import _, { sample } from "lodash";
import { Graph, json, Edge } from "graphlib";
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
            const nodeLabel: nodeLabelType = { size: 1, cells: [index] }; // Each node has a cellList of length 1, which is the index of the cell on the board
            g.setNode(index.toString(), nodeLabel);
        }
    }

    // Iterate over each cell and add edges to any adjacent cells
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const index = size * i + j;

            // Add an edge below the current cell, if it exists
            if (i < size - 1) {
                g.setEdge(index.toString(), (index + size).toString(), {weight: 2});
            }

            // Add an edge to the right of the current cell, if it exists
            if (j < size - 1) {
                g.setEdge(index.toString(), (index + 1).toString(), {weight: 2});
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
    graph.node(stayNode).size += graph.node(elimNode).size;

    // Get all neighbors of elimNode
    const neighbors = graph.neighbors(elimNode) || []; // O(|V|)
  

    const stayNodeSize = graph.node(stayNode).size;
    // Rewire edges and remove connections to elimNode
    for (const neighbor of neighbors) { // roughly O(1) iterations
      if (neighbor !== stayNode) {
        const neighborSize = graph.node(neighbor).size;
        // Create a new edge between stayNode and elimNode's neighbors
        graph.setEdge(stayNode, neighbor, {weight: neighborSize + stayNodeSize}); // O(1)
      }
    }
  
    // Remove elimNode from the graph
    graph.removeNode(elimNode); // O(E) time
}

// graph is relatively sparse, so O(V) and O(E) can be treated as identical;
// mergeNodes takes O(V) time, where V is at most n^2 and decreases over time.


/**
 * Given a graph, a list of edges, and a probability function, returns a random edge from the list
 * with probability proportional to the edge's weight times the result of the probability function.
 *
 * @param {Graph} graph the graph containing the edges
 * @param {Edge[]} edgeList the list of edges to sample from
 * @param {((w: any) => any)} probabilityFunction a function that takes an edge weight and returns a probability
 * @returns {Edge | undefined} a random edge from the list, or undefined if the list is empty
 */
const sampleFromEdgeList = (graph: Graph, edgeList: Edge[], probabilityFunction: (w: any) => any) => {
    // Get the weights of all the edges in the edgeList
    const weights = edgeList.map((edge) => graph.edge(edge).weight);
    // Calculate the probability of each edge being selected
    const probs = weights.map((weight) => probabilityFunction(weight));
    // Calculate the total probability of all the edges
    const c = _.sum(probs);

    // Generate a random number between 0 and the sum of all the probabilities
    const rand = Math.random() * c;
    let cum = 0; // cumulative probability
    for (let i = 0; i < probs.length; i++) {
        // Add the current edge's probability to the cumulative probability
        cum += probs[i];
        // If the random number is less than the cumulative probability, return the current edge
        if (rand < cum) {
            return edgeList[i];
        }
    }
}



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
        const probabilityFunction = (n: number) => (1/(n**2))
        const edge = sampleFromEdgeList(graph, graph.edges(), probabilityFunction);
        //commented code: const edge = _.sample(graph.edges());
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
    let num_iterations = 0;
    let avg_gen_time = 0;
    let avg_solve_time = 0;

    while(true) {
        num_iterations += 1;
        const generateStartTime = performance.now();
        const puzzleBoard = generateOneBoard(size);
        const generateEndTime = performance.now();
        avg_gen_time += (generateEndTime - generateStartTime);

        const solveStartTime = performance.now();
        const sols = solvePuzzle(clone(puzzleBoard));
        const solveEndTime = performance.now();
        avg_solve_time += (solveEndTime - solveStartTime);

        if (sols.length === 1){
            console.log(`number of puzzles generated: ${num_iterations}`);
            console.log(`average puzzle gen time: ${avg_gen_time/num_iterations} ms`);
            console.log(`average puzzle solve time: ${avg_solve_time/num_iterations} ms`);

            return puzzleBoard;
        }
    }
}

const testGenerationSpeed = (size: number, k: number) => {
    let totalGenerateTime = 0;
    for (let i = 0; i < k; i++) {
        const generateStartTime = performance.now();
        generateOneBoard(size);
        const generateEndTime = performance.now();
        totalGenerateTime += (generateEndTime - generateStartTime);
    }
    console.log(`average time per iteration: ${totalGenerateTime/k} ms`);
}

export {generateValidBoard, testGenerationSpeed, generateOneBoard}


// possible optimizations:
// optimize the puzzle solver to be rule-based instead of backtracking, 