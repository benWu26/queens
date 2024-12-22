import { cellType, boardType, playerStatusType, nodeLabelType} from "./types"
import _, { max, min } from "lodash";
import rfdc from 'rfdc';
const clone = rfdc();
import { Graph, json } from "graphlib";
import CustomGraph from "./CustomGraph";


// ------------------------HELPER STUFF----------------------------
// status transitions when a player clicks on a cell
const playerStatusTransitions: Record<playerStatusType, playerStatusType> = {
    "valid": "invalid",
    "invalid": "star",
    "star": "valid"
}

/**
 * Given a board, and the coordinates of a cell that a player is clicking on, this function will
 * return a Set of all cells in the board that are either in the same row, column, or color group
 * (but not in the same row and column) as the given cell.
 * @param {number} rowIndex
 * @param {number} columnIndex
 * @param {boardType} board
 * @returns {Set<cellType>}
 */
const getInvalidCells = (rowIndex: number, columnIndex: number, board: boardType) => {
    const invalidCells = new Set<cellType>();
    board.forEach((row, ridx) => {
        row.forEach((cell, cidx) => {
            if ((ridx === rowIndex) !== (cidx === columnIndex)) {
                invalidCells.add(cell);
            }
            if ((ridx + 1 === rowIndex || ridx - 1 === rowIndex) && (cidx + 1 === columnIndex || cidx - 1 === columnIndex)) {
                invalidCells.add(cell);
            }
            if (cell.color === board[rowIndex][columnIndex].color && (ridx !== rowIndex || cidx !== columnIndex)) {
                invalidCells.add(cell);
            }
        })
    })
    return invalidCells;
}

/**
 * Sets cell.playerStatus to "invalid" if it's not already "star", and adds the given coordinates to cell.causes.
 * @param {number} rowIndex
 * @param {number} columnIndex
 * @param {cellType} cell
 */
const autoInvalidateOneCell = (rowIndex: number, columnIndex: number, cell: cellType) => {
    if (cell.playerStatus !== "star") {
        cell.playerStatus = "invalid";
        cell.causes.push([rowIndex, columnIndex]);
    }
}

/**
 * Given a board, and the coordinates of a cell that a player is clicking on, this function will
 * set the playerStatus of all cells in the board that are either in the same row, column, or color
 * group (but not in the same row and column) to "invalid", and add the given coordinates to their
 * causes.
 * @param {number} rowIndex
 * @param {number} columnIndex
 * @param {boardType} board
 */
const autoInvalidateMultipleCells = (rowIndex: number, columnIndex: number, board: boardType) => {
    const invalidCells = getInvalidCells(rowIndex, columnIndex, board);
    invalidCells.forEach((cell) => {
        autoInvalidateOneCell(rowIndex, columnIndex, cell);
    })
}

/**
 * Given a board, and the coordinates of a cell that is being un-invalidated, this function will
 * remove the given coordinates from the causes of all other cells in the board.
 * If a cell has no remaining causes, it will be set to "valid" status.
 * @param {number} rowIndex
 * @param {number} columnIndex
 * @param {boardType} board
 */

const removeInvalidationCause = (rowIndex: number, columnIndex: number, board: boardType) => {
    board.forEach((row) => {
        row.forEach((cell) => {
            cell.causes = cell.causes.filter(c => !(_.isEqual(c, [rowIndex, columnIndex])))
            if (cell.causes.length === 0 && cell.playerStatus === "invalid") {
                cell.playerStatus = "valid";
            }
        })
    })
}

// ---------------------------------------- RESPONSES TO USER EVENTS (CLICK, DRAG) ---------------------------------------------------------

/**
 * Given a board, and the coordinates of a cell that a player is dragging over, this function will
 * update the board based on the rules of the game. If the cell is currently valid, it will be
 * set to "invalid" status, and the cause will be labeled as "human". If the cell is currently
 * invalid or a star, it will be left alone. This is used when a player is dragging the mouse
 * over the board, and we want to invalidate cells as the mouse moves over them.
 * @param {number} rowIndex
 * @param {number} columnIndex
 * @param {boardType} board
 * @returns {boardType}
 */
const invalidateCellOnDrag = (rowIndex: number, columnIndex: number, board: boardType): boardType => {
    console.log("invalidateCellOnDrag called")
    if (board[rowIndex][columnIndex].playerStatus === "valid") {
        console.log("if branch taken");
        const newBoard = clone(board);
        newBoard[rowIndex][columnIndex].playerStatus = "invalid"
        newBoard[rowIndex][columnIndex].causes.push("human");
        return newBoard;
    } else {
        return board;
    }
}

/**
 * Given a board, and the coordinates of a cell that a player is clicking on, this function will
 * update the board based on the rules of the game. If the cell is currently valid, it will be
 * set to "invalid". If the cell is currently invalid, it will be set to "star", and all other
 * cells in the same row, column, color, or diagonal will be set to "invalid". If the cell is
 * currently a star, it will be set to "valid", and all cells that were invalidated SOLELY because of
 * it will be set back to "valid". This function returns the updated board.
 * @param {number} rowIndex
 * @param {number} columnIndex
 * @param {boardType} board
 */
const updateBoard = (rowIndex: number, columnIndex: number, board: boardType) => {
    const newBoard: boardType = clone(board);
    const clickedCell = newBoard[rowIndex][columnIndex];
    const currentStatus = clickedCell.playerStatus;
    const nextStatus = playerStatusTransitions[currentStatus];
    clickedCell.playerStatus = nextStatus;

    if (nextStatus === "invalid") { // transition from valid to invalid
        clickedCell.causes.push("human");
    } else if (nextStatus === "star") { // transition from invalid to star
        clickedCell.causes = [];

        autoInvalidateMultipleCells(rowIndex, columnIndex, newBoard);

    } else { // transition from star to valid
        removeInvalidationCause(rowIndex, columnIndex, newBoard);
    }

    return newBoard;
}


// --------------------------- SOLUTION VALIDATION ------------------------------

/**
 * Validates whether a given board is a solution to the puzzle.
 * To be a solution, the board must have exactly one star in each row.
 * Additionally, no two cells in the same row, column, or color group can both be stars.
 * @param {boardType} board
 * @returns {boolean} whether the given board is a solution
 */
const validateSolution = (board: boardType) => {
    let numStars = 0;
    for (let [rowIndex, row] of board.entries()) {
        for (let [columnIndex, cell] of row.entries()) {
            if (cell.playerStatus === "star") {
                numStars++;
                const invalidCells = getInvalidCells(rowIndex, columnIndex, board);
                for (let c of invalidCells) {
                    if (c.playerStatus === "star") {
                        return false;
                    }
                }
            }
        }
    }
    return (numStars === board.length) ? true : false;
}

/**
 * Recursive step of the solvePuzzle algorithm.
 * @param {boardType} board the current state of the board
 * @param {number} ridx the row index to try placing a star in
 * @returns {boardType | false} the solved board if the algorithm finds a solution, otherwise false
 */
const solvePuzzleRecursiveStep = (board: boardType, ridx: number) : boardType[] => {
    if (ridx === board.length) {
        return [board];
    }

    const possibleSolutions: boardType[] = []

    for (const [cidx, cell] of board[ridx].entries()) {
        if (cell.playerStatus === "valid") {
            cell.playerStatus = "star";
            autoInvalidateMultipleCells(ridx, cidx, board);
            possibleSolutions.push(...solvePuzzleRecursiveStep(board, ridx+1));
            
            removeInvalidationCause(ridx, cidx, board);
            cell.playerStatus = "valid";
        }
    }

    return possibleSolutions;
}

// PUZZLE GENERATION
// create graph of n^2 vertices, each vertex corresponds to a cell
// an edge between two vertices means that those two cells are connected by an edge
// cell merge algorithm:
// select an edge of the cell at random
// take the two nodes that edge connects to
// merge them into one node, combine their cellLists together
// the number of the vertex is the min of the og vertex and the merged vertex

// data structure to represent a graph
// master list of edges to remove
// list of vertices (cells) stored separately


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
            console.log(index.toString());
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
function mergeNodes(graph: Graph, stayNode: string, elimNode: string): void {
    if (!graph.hasNode(stayNode) || !graph.hasNode(elimNode)) {
      throw new Error('Both stayNode and elimNode must exist in the graph.');
    }
  
    // Remove the edge between stayNode and elimNode if it exists
    if (graph.hasEdge(stayNode, elimNode)) {
      graph.removeEdge(stayNode, elimNode);
    }

    // Add all of elimNode's cells to stayNode
    graph.node(stayNode).cells.push(...graph.node(elimNode).cells);

    // Get all neighbors of elimNode
    const neighbors = graph.neighbors(elimNode) || [];
  
    // Rewire edges and remove connections to elimNode
    for (const neighbor of neighbors) {
      if (neighbor !== stayNode) {
        // Create a new edge between stayNode and elimNode's neighbors
        graph.setEdge(stayNode, neighbor);
      }
      // Remove the edge between elimNode and its neighbor
      graph.removeEdge(elimNode, neighbor);
    }
  
    // Remove elimNode from the graph
    graph.removeNode(elimNode);
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
    for (let i = 0; i < size**2 - size; i++) {
        if (graph.edges().length > 0){
            // select a random edge
            const edge = _.sample(graph.edges());
            if (edge) {
                // merge the two nodes that this edge connects
                mergeNodes(graph, edge.v, edge.w);
            }
            
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

    console.log(colorMap);

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
const generateBoard = (size: number): boardType => {
    // Create a graph with the given number of nodes
    const defaultGraph = createGraph(size);

    // Color the graph by repeatedly merging nodes until the graph has the desired number of nodes
    const coloredGraph = colorGraph(defaultGraph, size);

    // Construct a board from the colored graph
    const board = constructBoardFromGraph(coloredGraph);
    return board;
}


/**
 * Solves a given puzzle by placing stars in valid cells and trying to find a solution.
 * The algorithm works by trying to place a star in each valid cell in the first row, then
 * recursively trying to place a star in each valid cell in the next row, and so on.
 * If the algorithm can't find a solution, it returns false.
 * @param {boardType} board the puzzle to solve
 * @returns {boardType | false} the solved board if the algorithm finds a solution, otherwise false
 */
const solvePuzzle = (board: boardType) => {
    return solvePuzzleRecursiveStep(board, 0);
}

export {validateSolution, invalidateCellOnDrag, updateBoard, solvePuzzle, createGraph, colorGraph, constructBoardFromGraph, generateBoard};