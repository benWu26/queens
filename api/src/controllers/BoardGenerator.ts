import { cellType, boardType, nodeLabelType} from "shared"
import { solvePuzzleRecursively, solvePuzzleRuleBased } from "./BoardSolver";
import _ from "lodash";
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


/**
 * Samples an edge from a given list of edges in a graph, using a given probability function to weight the sampling.
 * @param {Graph} graph the graph containing the edges
 * @param {Edge[]} edgeList the list of edges to sample from
 * @param {(w: any) => any} probabilityFunction a function that takes an edge weight and returns a probability
 * @returns {Edge} the sampled edge
 */
const sampleFromEdgeList = (graph: Graph, edgeList: Edge[], probabilityFunction: (w: any) => any) => {
    // Calculate the weights of all edges in the list
    const weights = edgeList.map((edge) => graph.edge(edge).weight);

    // Calculate the probability of each edge being sampled, using the provided probability function
    const probs = weights.map((weight) => probabilityFunction(weight));

    // Calculate the cumulative probability of all edges
    const c = _.sum(probs);

    // Generate a random number between 0 and the cumulative probability
    const rand = Math.random() * c;

    // Iterate through the list of edges and return the first one that is less than or equal to the random number
    let cum = 0;
    for (let i = 0; i < probs.length; i++) {
        cum += probs[i];
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
        const probabilityFunction = (n: number) => (1/(n**6))
        const edge = sampleFromEdgeList(graph, graph.edges(), probabilityFunction);
        //const edge = _.sample(graph.edges());
        if (edge) {
            // merge the two nodes that this edge connects
            mergeNodes(graph, edge.v, edge.w); // O(E)
        }
    }

    return graph;
}

const constructColorMapFromGraph = (graph: Graph): number[][] => {
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
    });

    return colorMap;
}

/**
 * Takes a graph and constructs a board from it. The board is a 2D array of cells, where each cell has a color and player status.
 * The color of the cell is determined by the index of the node in the graph that contains the cell's index in its cellList.
 * The player status of each cell is initially set to "valid".
 * @param {Graph} graph the graph to construct the board from
 * @returns {boardType} the constructed board
 */
const constructBoardFromColorMap = (colorMap: number[][]): boardType => {
    // Create the board by mapping the color map to cells
    const board: boardType = colorMap.map((row, ridx) => row.map((c, cidx): cellType => {
        // Each cell has a color, player status, real status, and causes
        return {
            color: c,
            playerStatus: "valid",
            realStatus: "invalid",
            causes: [],
            row: ridx,
            column: cidx
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
    const colorMap = constructColorMapFromGraph(coloredGraph);
    const board = constructBoardFromColorMap(colorMap);
    return board;
}


/**
 * Generates a valid board of a given size by repeatedly generating boards until a valid one is found.
 * A valid board is one that has a unique solution.
 * @param {number} size the size of the board to generate
 * @returns {boardType} the generated board
 */
const generateValidBoardRuleBased = (size: number): boardType => {
    // Keep track of the number of iterations it takes to find a valid board
    let num_iterations = 0;
    // Keep track of the average time it takes to generate a board
    let avg_gen_time = 0;
    // Keep track of the average time it takes to solve a board
    let avg_solve_time = 0;

    const generateValidPuzzleStartTime = performance.now();

    // Keep generating boards until a valid one is found
    while (true) {
        num_iterations += 1;
        const generateOnePuzzleStartTime = performance.now();
        // Generate a random board of the given size
        const puzzleBoard = generateOneBoard(size);
        const generateOnePuzzleEndTime = performance.now();
        // Add the time it took to generate this board to the total
        avg_gen_time += (generateOnePuzzleEndTime - generateOnePuzzleStartTime);

        const solveStartTime = performance.now();
        // Solve the generated board
        const sols = solvePuzzleRuleBased(clone(puzzleBoard));
        const solveEndTime = performance.now();
        // Add the time it took to solve this board to the total
        avg_solve_time += (solveEndTime - solveStartTime);

        // If the board has a unique solution, return it
        if (sols) {
            const generateValidPuzzleEndTime = performance.now();
            console.log(`Total generation time: ${generateValidPuzzleEndTime - generateValidPuzzleStartTime} ms`)
            console.log(`   number of puzzles generated: ${num_iterations}`);
            console.log(`   average puzzle gen time: ${avg_gen_time / num_iterations} ms`);
            console.log(`   average puzzle solve time: ${avg_solve_time / num_iterations} ms`);

            return puzzleBoard;
        }
    }
}

const generateValidBoardRecursive = (size: number): boardType => {
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
        const sols = solvePuzzleRecursively(clone(puzzleBoard));
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

export {generateValidBoardRuleBased, testGenerationSpeed, generateOneBoard, generateValidBoardRecursive}