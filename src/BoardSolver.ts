import { getInvalidCells, autoInvalidateMultipleCells, removeInvalidationCause } from "./BoardInteractionLogic";
import { boardType, playerStatusType, cellType, cellGroupType } from "./types";

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
    rows: cellGroupType[];
    columns: cellGroupType[];
    colorGroups: cellGroupType[];
};

const createDefaultCellGroup = (): cellGroupType => {
    return {
        cells: new Set<cellType>(),
        resolved: false
    };
}


const splitBoardIntoGroups = (board: boardType): boardGroupsType => {
    const rows: cellGroupType[] = []
    const columns: cellGroupType[] = []
    const colorGroups: cellGroupType[] = []

    for (let i = 0; i < board.length; i++) {
        rows.push(createDefaultCellGroup());
        columns.push(createDefaultCellGroup());
        colorGroups.push(createDefaultCellGroup());
    }
    for (let row of board) {
        for (let cell of row) {
            rows[cell.row].cells.add(cell);
            columns[cell.column].cells.add(cell);
            colorGroups[cell.color].cells.add(cell);
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
        if (group.cells.size === 0 && group.resolved === false) return true;
    }
    return false;
}

const removeCellFromGroup = (cell: cellType, groups: boardGroupsType) => {
    groups.rows[cell.row].cells.delete(cell);
    groups.columns[cell.column].cells.delete(cell);
    groups.colorGroups[cell.color].cells.delete(cell);
}

// rule 1: if a set only has one valid cell, star it and auto invalidate
// return the list of changes (star that cell, invalidate everything else)
const applyStarPlacementRule = (board: boardType, groups: boardGroupsType) => {

    for (let group of [...groups.rows, ...groups.columns, ...groups.colorGroups]) {
        if (group.cells.size === 1 && group.resolved === false) {
            
            const cell = group.cells.values().next().value!;
            console.log(`placing star, group size 1 found at row ${cell.row}, column ${cell.column}`);
            if (cell) {
                cell.playerStatus = "star";
                removeCellFromGroup(cell, groups);
                groups.rows[cell.row].resolved = true;
                groups.columns[cell.column].resolved = true;
                groups.colorGroups[cell.color].resolved = true;

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

// n = 10, r = 2:
// 0,1  1,2  2,3  3,4  4,5  5,6  6,7  7,8  8,9 
// 012 123 234 456

/**
 * Generates all possible sets of r consecutive indices from 0 to n-1.
 *
 * For example, if n = 5 and r = 3, the output would be:
 * [[0, 1, 2], [1, 2, 3], [2, 3, 4]]
 *
 * @param {number} n The upper limit of the range of indices (exclusive).
 * @param {number} r The number of consecutive indices to include in each set.
 * @returns {number[][]} An array of arrays, where each sub-array is a set of r
 * consecutive indices from 0 to n-1.
 */
const generateConsecutiveIndexSets = (n: number, r: number) => {
    const indexSets = []
    // iterate over the range of indices, starting from 0 and going up to n - r + 1
    for (let i = 0; i < n - r + 1; i++) {
        const indexSet = []; // initialize an empty array to store the current set of indices
        // iterate over the current set of indices, starting from i and going up to i + r
        for (let j = i; j < i + r; j++) {
            // push the current index to the set of indices
            indexSet.push(j);
        }
        // push the current set of indices to the array of all sets of indices
        indexSets.push(indexSet);
    }
    return indexSets;
}

const getMergedRCGroups = (groups: boardGroupsType, total_size: number, merge_size: number) => {
    const indexSets = generateConsecutiveIndexSets(total_size, merge_size);
    
    // for each set in indexSets:
    // select those indices of rows/columns
    // destructure into one "group"
    const mergedRowGroups: Set<cellType>[] = [];
    const mergedColumnGroups: Set<cellType>[] = [];
    indexSets.forEach(indexSet => {
        const mergedRowGroup: Set<cellType> = new Set();
        const mergedColumnGroup: Set<cellType> = new Set();
        let shouldCancelMerging = false;
        indexSet.forEach(idx => {
            if (groups.rows[idx].resolved || groups.columns[idx].resolved) {
                shouldCancelMerging = true;
                return;
            }
            for (let cell of groups.rows[idx].cells) mergedRowGroup.add(cell);
            for (let cell of groups.columns[idx].cells) mergedColumnGroup.add(cell);
        });
        if (shouldCancelMerging) return;
        mergedRowGroups.push(mergedRowGroup);
        mergedColumnGroups.push(mergedColumnGroup);
    });
    return [mergedRowGroups, mergedColumnGroups];
}

/**
 * Applies the icicle rule to the given board and groups.
 * @param {boardType} board The board to apply the rule to.
 * @param {boardGroupsType} groups The groups of cells on the board.
 * @returns {cellChangeType[]|false} An array of cell changes if the rule was applied, false otherwise.
 */
const applyIcicleRule = (board: boardType, groups: boardGroupsType): cellChangeType[] | false => {
    // do across rows and columns first?
    // for getting multiple rows:
    // select two contiguous rows/columns
    // check if there are 2 colors contained within
    // scale up to n

    for (let i = 1; i < 4; i++) {
        const [mergedRowGroups, mergedColumnGroups] = getMergedRCGroups(groups, board.length, i);

        for (let group of [...mergedRowGroups, ...mergedColumnGroups]) {
            const colors = new Set<number>();
            for (let cell of group) colors.add(cell.color);
            if (colors.size == i) {
                const mergedColorGroup = new Set(
                    Array.from(colors).flatMap(color => Array.from(groups.colorGroups[color].cells || []))
                );
                if (mergedColorGroup.size > group.size) {
                    console.log(`color elimination happening with i = ${i}`);
                    const changes: cellChangeType[] = [];

                    for (let cell of mergedColorGroup) {
                        if (!group.has(cell)) {
                            cell.playerStatus = "invalid";
                            changes.push([cell.row, cell.column, "invalid"]);
                            removeCellFromGroup(cell, groups);
                        }
                    }
                    console.log(changes);
                    return changes;
                }
            }
        }        
    }
    return false;
}

const applyReverseIcicleRule = (board: boardType, groups: boardGroupsType): cellChangeType[] | false => {

    for (let i = 1; i < 4; i++) {
        const [mergedRowGroups, mergedColumnGroups] = getMergedRCGroups(groups, board.length, i);

        for (let group of [...mergedRowGroups, ...mergedColumnGroups]) {
            // get all the colors present
            // for each color, see if that entire color group is present inside of the merged group
            // if this holds for i colors, then we must eliminate everything inside the merged group not 
            // in the i colors.
            const colors = new Set<number>();
            for (let cell of group) colors.add(cell.color);
            const lockedColors = new Set<number>();
            colors.forEach(color => {
                let isColorLocked = true;
                // is the entire color group present inside the merged group?
                groups.colorGroups[color].cells.forEach(cell => {
                    if (!group.has(cell)) {
                        isColorLocked = false;
                    }
                });
                if (isColorLocked) {
                    lockedColors.add(color);
                }
            });
            if (lockedColors.size === i && colors.size > i) {
                console.log("reverse icicle called")
                const changes: cellChangeType[] = [];
                group.forEach(cell => {
                    if (!lockedColors.has(cell.color)) {
                        cell.playerStatus = "invalid";
                        changes.push([cell.row, cell.column, "invalid"]);
                        removeCellFromGroup(cell, groups);
                    }
                })
                console.log(changes);
                return changes;
            }
        }
    }
    return false;
}

const applyIntersectionRule = (board: boardType, groups: boardGroupsType): cellChangeType[] | false => {
    let sortedColorGroups = Array.from(groups.colorGroups).sort(
        (a, b) => a.cells.size - b.cells.size
    );
    sortedColorGroups = sortedColorGroups.filter(group => group.cells.size > 0);
    

    for (let colorGroup of sortedColorGroups) {
        const invalidationSets: Set<cellType>[] = []; 
        colorGroup.cells.forEach(cell => {
            const invalidationSet = new Set<cellType>(getInvalidCells(cell.row, cell.column, board));
            invalidationSets.push(invalidationSet);
        });
        const intersection = invalidationSets.reduce(
            (prev, current) => new Set([...prev].filter(x => current.has(x)))
        );
        if (intersection.size > 0) {
            const changes: cellChangeType[] = [];
            for (let cell of intersection) {
                if (cell.playerStatus !== "invalid") {
                    cell.playerStatus = "invalid";
                    changes.push([cell.row, cell.column, "invalid"]);
                    removeCellFromGroup(cell, groups);
                }
            }
            if (changes.length) {
                console.log("intersection rule");
                console.log(changes);
                return changes;
            }
        }
    }

    return false;
}

// how does reverse icicle rule work?
// look through a (preferably contiguous) group of rows/columns
// tbh, the merge group should be its own separate function


const rules = [applyStarPlacementRule, applyIcicleRule, applyReverseIcicleRule, applyIntersectionRule];



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

    const solveStartTime = performance.now();

    let iterations = 0;
    while (iterations < 100) {
        const result = solvePuzzleOneIteration(board, groups);
        if (!result || result === true) {
            break;
        }
        iterations++;
    }

    const solveEndTime = performance.now();

    console.log(`rule based solver: ${solveEndTime - solveStartTime} ms`)
}





export {validateSolution, solvePuzzleRecursively, solvePuzzleRuleBased}