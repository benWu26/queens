import { getInvalidCells, autoInvalidateMultipleCells, removeInvalidationCause } from "./BoardInteractionLogic"
import { boardType, cellType, cellGroupType } from "./types"
import rfdc from "rfdc";
const clone = rfdc();
import _ from "lodash";
import {cellChangeType, ruleFunctionType, boardGroupsType, ruleReturnType} from "./types"
// --------------------------- SOLUTION VALIDATION ------------------------------

const areTwoCellsMutuallyExclusive = (cell1: cellType, cell2: cellType) => {
    if (cell1 === cell2) return false;
    return (cell1.row === cell2.row || cell1.column === cell2.column || cell1.color === cell2.color);
}

/**
 * Validates whether a given board is a solution to the puzzle.
 * To be a solution, the board must have exactly one star in each row.
 * Additionally, no two cells in the same row, column, or color group can both be stars.
 * @param {boardType} board
 * @returns {boolean} whether the given board is a solution
 */
const validateSolution = (board: boardType): boolean => {
    const stars: cellType[] = []
    for (let row of board) {
        for (let cell of row) {
            if (cell.playerStatus === "star") {
                stars.push(cell);
            }
        }
    }
    if (stars.length !== board.length) return false;

    for (let i = 0; i < stars.length - 1; i++) {
        for (let j = i + 1; j < stars.length; j++) {
            if (areTwoCellsMutuallyExclusive(stars[i], stars[j])) {
                return false;
            }
        }
    }

    return true;
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
            if (cell.playerStatus === "valid"){
                rows[cell.row].cells.add(cell);
                columns[cell.column].cells.add(cell);
                colorGroups[cell.color].cells.add(cell);
            } else if (cell.playerStatus === "star") {
                rows[cell.row].resolved = true;
                columns[cell.column].resolved = true;
                colorGroups[cell.color].resolved = true;
            }
        }
    }
    return {rows, columns, colorGroups};
}

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

const markInvalidCell = (cell: cellType, changes: cellChangeType[], groups: boardGroupsType) => {
    if (cell.playerStatus !== "invalid") {
        changes.push([cell.row, cell.column, "invalid"]);
        cell.playerStatus = "invalid";
        removeCellFromGroup(cell, groups);
    }
}

const markStarCell = (cell: cellType, groups: boardGroupsType, board: boardType): ruleReturnType => {
    const changes: cellChangeType[] = [];
    changes.push([cell.row, cell.column, 'star']);
    cell.playerStatus = "star";
    removeCellFromGroup(cell, groups);
    groups.rows[cell.row].resolved = true;
    groups.columns[cell.column].resolved = true;
    groups.colorGroups[cell.color].resolved = true;

    const invalidCells = getInvalidCells(cell.row, cell.column, board);

    invalidCells.forEach(invalidCell => {
        markInvalidCell(invalidCell, changes, groups);
    })
    return {changes, difficulty: 0}

}

// rule 1: if a set only has one valid cell, star it and auto invalidate
// return the list of changes (star that cell, invalidate everything else)
const applyStarPlacementRule = (board: boardType, groups: boardGroupsType): ruleReturnType | false => {

    for (let group of [...groups.rows, ...groups.columns, ...groups.colorGroups]) {
        if (group.cells.size === 1 && group.resolved === false) {
            
            const cell = group.cells.values().next().value!;
            //console.log(`placing star, group size 1 found at row ${cell.row}, column ${cell.column}`);
            if (cell) {
                return markStarCell(cell, groups, board);
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
const generateConsecutiveIndexSets = (n: number, r: number): number[][] => {
    const indexSets: number[][] = []
    // iterate over the range of indices, starting from 0 and going up to n - r + 1
    for (let i = 0; i < n - r + 1; i++) {
        const indexSet: number[] = []; // initialize an empty array to store the current set of indices
        // iterate over the current set of indices, starting from i and going up to i + r
        for (let j = i; j < i + r; j++) {
            // push the current index to the set of indices
            indexSet.push(j);
        }
        // push the current set of indices to the array of all sets of indices
        indexSets.push(indexSet);
    }

    if (r === 2){
        for (let i = 0; i < n - r; i++){
            const indexSet: number[] = [];
            indexSet.push(i);
            indexSet.push(i+2);
            indexSets.push(indexSet);
        }
    }

    return indexSets;
}

/**
 * Given a boardGroupsType, total_size, and merge_size, this function will group the rows and columns
 * into sets of size merge_size, and return two arrays of Sets, one for each. The sets will contain
 * all the cells in the corresponding groups, and will be ordered in the same order as the original
 * indexSets.
 *
 * @param {boardGroupsType} groups The groups of rows and columns to be merged.
 * @param {number} total_size The total number of rows or columns to be grouped.
 * @param {number} merge_size The size of each set of indices to be grouped.
 * @returns {[Set<cellType>[], Set<cellType>[]]} Two arrays of Sets, one for the merged row groups
 * and one for the merged column groups.
 */
const getMergedRCGroups = (groups: boardGroupsType, total_size: number, merge_size: number) => {
    const indexSets = generateConsecutiveIndexSets(total_size, merge_size);
    
    // for each set in indexSets:
    // select those indices of rows/columns
    // destructure into one "group"
    const mergedRowGroups: Set<cellType>[] = [];
    const mergedColumnGroups: Set<cellType>[] = [];
    indexSets.forEach(indexSet => {
        let shouldMergeRows = true;
        let shouldMergeColumns = true;
        indexSet.forEach(idx => {
            if (groups.rows[idx].resolved === true) {
                shouldMergeRows = false;
                return;
            }
        });

        indexSet.forEach(idx => {
            if (groups.columns[idx].resolved === true) {
                shouldMergeColumns = false;
                return;
            }
        })
        
        if (shouldMergeRows){
            const mergedRowGroup: Set<cellType> = new Set();
            indexSet.forEach(idx => {
                groups.rows[idx].cells.forEach(cell => {
                    mergedRowGroup.add(cell);
                })
            })

            mergedRowGroups.push(mergedRowGroup);
        }
        

        if (shouldMergeColumns) {
            const mergedColumnGroup: Set<cellType> = new Set();
            indexSet.forEach(idx => {
                groups.columns[idx].cells.forEach(cell => {
                    mergedColumnGroup.add(cell);
                })
            })

            mergedColumnGroups.push(mergedColumnGroup);
        }
    });
    return [mergedRowGroups, mergedColumnGroups];
}

/**
 * Applies the icicle rule to the given board and groups.
 * @param {boardType} board The board to apply the rule to.
 * @param {boardGroupsType} groups The groups of cells on the board.
 * @returns {cellChangeType[]|false} An array of cell changes if the rule was applied, false otherwise.
 */
const applyIcicleRule = (board: boardType, groups: boardGroupsType): ruleReturnType | false => {
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

            // icicle rule
            if (colors.size === i) {
                const mergedColorGroup = new Set(
                    Array.from(colors).flatMap(color => Array.from(groups.colorGroups[color].cells || []))
                );
                if (mergedColorGroup.size > group.size) {
                    const changes: cellChangeType[] = [];
                    //console.log(`icicle rule invoked, i=${i}`)
                    for (let cell of mergedColorGroup) {
                        if (!group.has(cell)) {
                            cell.playerStatus = "invalid";
                            changes.push([cell.row, cell.column, "invalid"]);
                            removeCellFromGroup(cell, groups);
                        }
                    }
                    //console.log(changes);
                    return {changes, difficulty: i}
                }
            }

            // reverse icicle rule
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
                //console.log(`reverse icicle rule invoked, i=${i}`);
                const changes: cellChangeType[] = [];
                group.forEach(cell => {
                    if (!lockedColors.has(cell.color)) {
                        markInvalidCell(cell, changes, groups);
                    }
                })
                //console.log(changes);
                return {changes, difficulty: i}
            }
        }        
    }
    return false;
}

/**
 * Given a group of cells, returns a list of changes to the board if the "intersection of invalidated sets" rule
 * is applicable. If the rule is not applicable, returns false.
 * The intersection of invalidated sets rule is as follows: if a group of cells has a set of cells that are
 * invalidated by all of the cells in the group, then we can invalidate those cells too. This is because
 * if all of the cells in the group are valid, then the cells in the intersection would be in an invalid
 * state, which is impossible.
 * @param {cellGroupType} cellGroup
 * @param {boardGroupsType} groups
 * @param {boardType} board
 * @returns {cellChangeType[] | false}
 */
const markIntersectionOfInvalidatedSets = (cellGroup: cellGroupType, groups: boardGroupsType, board: boardType) => {
    const invalidationSets: Set<cellType>[] = []; 
    cellGroup.cells.forEach(cell => {
        const invalidationSet = new Set<cellType>(getInvalidCells(cell.row, cell.column, board));
        invalidationSets.push(invalidationSet);
    });
    const intersection = invalidationSets.reduce(
        (prev, current) => new Set([...prev].filter(x => current.has(x)))
    );
    if (intersection.size > 0) {
        const changes: cellChangeType[] = [];
        for (let cell of intersection) {
            markInvalidCell(cell, changes, groups);
        }
        if (changes.length) {
            //console.log("intersection rule");
            //console.log(changes);
            return changes;
        }
    }
    return false;
}

/**
 * Applies the "intersection of invalidated sets" rule to the given board and groups.
 * This rule states that if a group of cells has a set of cells that are invalidated by all of the cells in the group, then we can invalidate those cells too.
 * This is because if all of the cells in the group are valid, then the cells in the intersection would be in an invalid state, which is impossible.
 * @param {boardType} board The board to apply the rule to.
 * @param {boardGroupsType} groups The groups of cells on the board.
 * @returns {cellChangeType[] | false} An array of cell changes if the rule was applied, false otherwise.
 */
const applyIntersectionRule = (board: boardType, groups: boardGroupsType): ruleReturnType | false => {
    let sortedColorGroups = Array.from(groups.colorGroups).sort(
        (a, b) => a.cells.size - b.cells.size
    );
    sortedColorGroups = sortedColorGroups.filter(group => group.cells.size > 0);
    

    for (let colorGroup of sortedColorGroups) {
        const result = markIntersectionOfInvalidatedSets(colorGroup, groups, board);
        if (result) return {changes: result, difficulty: colorGroup.cells.size};
    }

    let sortedRowColumnGroups = [...groups.rows, ...groups.columns].sort(
        (a, b) => a.cells.size - b.cells.size
    );
    sortedRowColumnGroups = sortedRowColumnGroups.filter(group => (group.cells.size > 0 && group.cells.size < 4));

    for (let rcGroup of sortedRowColumnGroups) {
        const result = markIntersectionOfInvalidatedSets(rcGroup, groups, board);
        if (result) return {changes: result, difficulty: rcGroup.cells.size + 1};
    }
    return false;
}

const rulesWithoutBranching = [applyStarPlacementRule, applyIcicleRule, applyIntersectionRule];


/**
 * Applies the branching rule to the given board and groups.
 * The branching rule is as follows: given a group of cells of size k<4, create a copy of the board for each cell in the group, and place a star in one of the cells.
 * Then, for each branch, run one step of solvePuzzleOneIteration, but without the branching rule.
 * After each step, compare downstream consequences between all branches.
 * If any changes are shared between all branches, apply that change(s) and return.
 * @param {boardType} board The board to apply the rule to.
 * @param {boardGroupsType} groups The groups of cells on the board.
 * @returns {cellChangeType[] | false} An array of cell changes if the rule was applied, false otherwise.
 */
const applyBranchRule = (board: boardType, groups: boardGroupsType): ruleReturnType | false => {
    //console.log(groups);
    const allGroups = [...groups.rows, ...groups.columns, ...groups.colorGroups];
    const filteredGroups = allGroups
        .filter(group => group.cells.size === 2)
        //.reduce((prev, current) => (prev.cells.size < current.cells.size) ? prev : current);

    if (!filteredGroups.length) {
        return false;
    }

    const smallestGroup = filteredGroups
        .reduce((prev, current) => (prev.cells.size < current.cells.size) ? prev : current);


    // choose the smallest group (should be k<4, otherwise return false);
    // create a copy of the board, place a star in one of the cells
    // on each copy of the board, run one step of solvePuzzleOneIteration
    // after each step, compare downstream consequences
    // if any changes are shared between all branches, apply that change(s) and return

    const branchedBoards: boardType[] = [];
    const branchedGroupsList: boardGroupsType[] = [];
    const changeLists: cellChangeType[][] = [];
    smallestGroup.cells.forEach(cell => {
        const branchBoard = clone(board);
        const branchGroups = splitBoardIntoGroups(branchBoard);
        //console.log(branchBoard);
        markStarCell(branchBoard[cell.row][cell.column], branchGroups, branchBoard);
        //console.log(branchBoard);

        branchedBoards.push(branchBoard);
        branchedGroupsList.push(branchGroups);
        changeLists.push([] as cellChangeType[]);
    });

    const changes: cellChangeType[] = [];

    // take turns on each board-group-changes set running solvePuzzleOneIteration
    // but a version without the branching rule
    
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < smallestGroup.cells.size; j++) {
            const result = solvePuzzleOneIteration(branchedBoards[j], branchedGroupsList[j], rulesWithoutBranching);
            if (typeof result !== "boolean") {
                changeLists[j].push(...result.changes);
            }
        }
        const intersection: cellChangeType[] = [];
        changeLists.forEach(changeList => {
            changeList.forEach(change => {
                if (changeLists.every(cl => cl.some(c => {
                    return _.isEqual(c, change);
                }))) {
                    intersection.push(change);
                }
            })
        })

        if (intersection.length) {
            intersection.forEach(change => {
                markInvalidCell(board[change[0]][change[1]], changes, groups);
            })
            return {
                changes,
                difficulty: 5*(i+1)
            }
        }
    }

    return false;

    
}


const rulesWithBranching = [applyStarPlacementRule, applyIcicleRule, applyIntersectionRule, applyBranchRule];


/**
 * Runs one iteration of the rule-based solver on the given board and groups.
 * If the board is impossible, or if the board is solved, returns true or false.
 * Otherwise, applies each rule in the given list of rules to the board and groups.
 * If any rule returns a change list, applies those changes and returns the list.
 * If no rule returns a change list, returns false.
 * @param {boardType} board The board to solve.
 * @param {boardGroupsType} groups The groups of cells on the board.
 * @param {ruleFunctionType[]} rules The list of rules to apply.
 * @returns {cellChangeType[] | boolean} The change list if a rule was applied, or true if the board is solved, or false if the board is impossible.
 */
const solvePuzzleOneIteration = (board: boardType, groups: boardGroupsType, rules: ruleFunctionType[]): ruleReturnType | boolean => {
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

/**
 * Solves the given puzzle using the rule-based solver.
 * The rule-based solver works by applying all of the rules in the given list of rules to the board and groups.
 * If any rule returns a change list, applies those changes and returns the list.
 * If no rule returns a change list, returns false.
 * If the board is impossible, or if the board is solved, returns true or false.
 * @param {boardType} board The board to solve.
 * @returns {cellChangeType[] | boolean} The change list if a rule was applied, or true if the board is solved, or false if the board is impossible.
 */
const solvePuzzleRuleBased = (board: boardType) => {
    // splitting the board into groups will help out significantly.
    // especially because the board is comprised of cells, and cells are objects,
    // so editing something in the board will edit something in the groups and vice versa
    // each group should ONLY contain valid cells, will make things easier
    const groups = splitBoardIntoGroups(board);
    let difficulty = 0;

    let iterations = 0;
    while (iterations < 100) {
        const result = solvePuzzleOneIteration(board, groups, rulesWithBranching);

        if (result === true) {
            return {result, difficulty}
        } else if (!result) {
            return false;
        } else {
            difficulty += result.difficulty
        }
    }
}

export {validateSolution, solvePuzzleRecursively, solvePuzzleRuleBased}