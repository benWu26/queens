import { getInvalidCells, autoInvalidateMultipleCells, removeInvalidationCause } from "./BoardInteractionLogic";
import { boardType, playerStatusType, cellType } from "./types";

// --------------------------- SOLUTION VALIDATION ------------------------------

/**
 * Validates whether a given board is a solution to the puzzle.
 * To be a solution, the board must have exactly one star in each row.
 * Additionally, no two cells in the same row, column, or color group can both be stars.
 * @param {boardType} board
 * @returns {boolean} whether the given board is a solution
 */
const validateSolution = (board: boardType): boolean => {
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


/**
 * Solves a given puzzle by placing stars in valid cells and trying to find a solution.
 * The algorithm works by trying to place a star in each valid cell in the first row, then
 * recursively trying to place a star in each valid cell in the next row, and so on.
 * If the algorithm can't find a solution, it returns false.
 * @param {boardType} board the puzzle to solve
 * @returns {boardType | false} the solved board if the algorithm finds a solution, otherwise false
 */
const solvePuzzleRecursively = (board: boardType) => {
    return solvePuzzleRecursiveStep(board, 0);
}

// rule based solver:
// apply list of rules sequentially
// if one of the rules works, jump back to start and keep chugging

// rule 1
// rule 2
// rule 3
// ...
// rule n

// each rule should return the board if the board was altered, or false if the rule wasn't applied
// once the return statement of a rule returns true, jump back and keep applying them
// at the start of each run of rules, check if the board is solved (call validateSolution)
// if validateSolution returns true, return the curent state of the board

type cellChangeType = [number, number, playerStatusType];
type ruleFunctionType = (board: boardType, groups: boardGroupsType) => cellChangeType[] | false;

type boardGroupsType = {
    rows: Set<cellType>[];
    columns: Set<cellType>[];
    colorGroups: Set<cellType>[];
};


const splitBoardIntoGroups = (board: boardType): boardGroupsType => {
    const rows: Set<cellType>[] = [];
    const columns: Set<cellType>[] = [];
    const colorGroups: Set<cellType>[] = [];

    for (let i = 0; i < board.length; i++) {
        rows.push(new Set());
        columns.push(new Set());
    }
    for (let row of board) {
        for (let cell of row) {
            rows[cell.row].add(cell);
            columns[cell.column].add(cell);
            colorGroups[cell.color] = colorGroups[cell.color] || new Set();
            colorGroups[cell.color].add(cell);
        }
    }
    return {rows, columns, colorGroups};
}







// rule 2: if the union of k sets K1 = ({s1 U s2 U s3 U sn}) valid cells are 
// a subset of the union of another k sets K2 = ({S1 U S2 U S3...Sn}) valid cells,
// then any cells in K2 not in K1 must be eliminated.
// s1, s2, s3 all share a type (row, column, or color) as do S1, S2, and S3
// return the list of changes (would be cells that were invalidated)

// rule 3: if a cell invalidates all cells in a group, then that cell has to be invalid.
// because elimination is a reflexive relation (a elim b <-> b elim a), we can rephrase it as:
// if all cells in a group invalidate a certain cell, that cell must be eliminated.
// return the list of changes (would be cells that were invalidated)

// rule 4, guessing rule:
// if rule 1 and 2 fail, find the group with the least amount of valid cells (k).
// create k different copies of the board, where each copy tests out a different star placement.
// run the rule-based solver on each one and keep track of changes somehow.
// if any changes occur on all branches, then that change has to occur. apply it to the main board, return true;

// rule 0: if a set is all invalid, the board is unsolvable, return false.
const isBoardImpossible = (groups: boardGroupsType): boolean => {
    for (let group of [...groups.rows, ...groups.columns, ...groups.colorGroups]) {
        if (group.size === 0) return true;
    }
    return false;
}

const removeCellFromGroup = (cell: cellType, groups: boardGroupsType) => {
    groups.rows[cell.row].delete(cell);
    groups.columns[cell.column].delete(cell);
    groups.colorGroups[cell.color].delete(cell);
}

// rule 1: if a set only has one valid cell, star it and auto invalidate
// return the list of changes (star that cell, invalidate everything else)
const applyStarPlacementRule = (board: boardType, groups: boardGroupsType) => {
    for (let group of [...groups.rows, ...groups.columns, ...groups.colorGroups]) {
        if (group.size === 1) {
            console.log("group size 1 found");
            const cell = group.values().next().value;
            if (cell) {
                cell.playerStatus = "star";
                removeCellFromGroup(cell, groups);

                const changes: cellChangeType[] = [];
                const invalidCells = getInvalidCells(cell.row, cell.column, board);

                invalidCells.forEach(invalidCell => {
                    changes.push([invalidCell.row, invalidCell.column, "invalid"]);
                    invalidCell.playerStatus = "invalid";
                    removeCellFromGroup(invalidCell, groups);
                })
                return changes;
            }
        }
    }

    return false;
}

const applyUnionEliminationRule = (board: boardType, groups: boardGroupsType) => {
    // do across rows and columns first?
    for (let group of [...groups.rows, ...groups.columns]) {
        let uniColorGroup = true;
        let color = group.values().next().value!.color;
        for (let cell of group) {
            if (color != cell.color) {
                uniColorGroup = false;
            }
        }
        if (uniColorGroup) {
            // eliminate everything in color's group not in the group
            const colorGroup = groups.colorGroups[color];
            const changes: cellChangeType[] = [];
            for (let cell of colorGroup) {
                if (!group.has(cell)) {
                    cell.playerStatus = "invalid";
                    changes.push([cell.row, cell.column, "invalid"])
                    removeCellFromGroup(cell, groups);
                }
            }
            return changes;
        }
    }
    return false;
}

const rules = [applyStarPlacementRule, applyUnionEliminationRule];



const solvePuzzleOneIteration = (board: boardType, groups: boardGroupsType) => {
    if (isBoardImpossible(groups)) {
        return false;
    }
    if (validateSolution(board)) {
        return true;
    }
    for (let rule of rules) {
        const result = rule(board, groups);
        if (result) {
            console.log("rule called");
            return result;
        }
    }
    return false;
}

const solvePuzzleRuleBased = (board: boardType) => {
    // splitting the board into groups will help out significantly.
    // especially because the board is comprised of cells, and cells are objects,
    // so editing something in the board will edit something in the groups and vice versa
    // each group should ONLY contain valid cells, will make things easier
    const groups = splitBoardIntoGroups(board);

    while (true) {
        const result = solvePuzzleOneIteration(board, groups);
        if (!result || result === true) break;
    }
}





export {validateSolution, solvePuzzleRecursively, solvePuzzleRuleBased}