import { useCallback, useState, useRef } from "react";
import Cell from "./Cell";
import { cellType, boardType, playerStatusType } from "./types"
import _ from "lodash";
import rfdc from 'rfdc';
const clone = rfdc();

import sampleBoard from "./sampleBoard";

// HELPER STUFF
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
const autoInvalidateCell = (rowIndex: number, columnIndex: number, cell: cellType) => {
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
const autoInvalidateCells = (rowIndex: number, columnIndex: number, board: boardType) => {
    const invalidCells = getInvalidCells(rowIndex, columnIndex, board);
    invalidCells.forEach((cell) => {
        autoInvalidateCell(rowIndex, columnIndex, cell);
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

        autoInvalidateCells(rowIndex, columnIndex, newBoard);

    } else { // transition from star to valid
        removeInvalidationCause(rowIndex, columnIndex, newBoard);
    }

    return newBoard;
}


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


// react component of the game board
function Board() {
    // using board as a state variable
    const [board, setBoard] = useState(sampleBoard);

    // ref variable for detecting if mouse is pressed or not
    const mouseDownRef = useRef(false);

    // updates the board when a cell is clicked
    const onCellClick = useCallback((rowIndex: number, columnIndex: number): void => {
        setBoard((b): boardType => updateBoard(rowIndex, columnIndex, b));
    }, [])

    // when the mouse is dragged over a cell, invalidates the cell if the mouse is pressed
    const onDrag = useCallback((rowIndex: number, columnIndex: number): void => {
        if (mouseDownRef.current) {
            setBoard((b): boardType => invalidateCellOnDrag(rowIndex, columnIndex, b));
        }
        
    }, []);

    return (
        // style board to be an nxn grid
        <>
            <div className="board" style={{ "--grid-size": `repeat(${board.length}, 1fr)` } as React.CSSProperties} onMouseDown={() => {mouseDownRef.current = true}} onMouseUp={() => {mouseDownRef.current = false}}>
                {
                    // 2 layers of mapping
                    board.map((row, rowIndex) => row.map((cell, columnIndex) => {
                        // cell props:
                        // key (calculated by treating the 2d array as a 1d array)
                        // cell: cellType
                        // updatePlayerStatus: called when the cell is clicked
                        return <Cell key={rowIndex * board.length + columnIndex}
                            color={cell.color}
                            playerStatus={cell.playerStatus}
                            updatePlayerStatusClick={() => onCellClick(rowIndex, columnIndex)}
                            updatePlayerStatusDrag={() => onDrag(rowIndex, columnIndex)}
                            ></Cell>
                            
                    }))
                }
            </div>
            <p>{validateSolution(board) ? "complete" : "incomplete"}</p>
        </>
    )
}

export default Board;