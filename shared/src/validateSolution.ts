import { cellType, boardType } from "./types";

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

export {validateSolution}