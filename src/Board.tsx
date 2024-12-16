import { useCallback, useState } from "react";
import Cell from "./Cell";
import { cellType, boardType, playerStatusType } from "./types"
import _ from "lodash";

// status transitions when a player clicks on a cell
const playerStatusTransitions: Record<playerStatusType, playerStatusType> = {
    "valid": "invalid",
    "invalid": "star",
    "star": "valid"
}

// maps out the color of each cell on the board
const sampleColorMap = [
    [0, 0, 0, 1, 1, 1, 1, 1],
    [2, 0, 2, 1, 1, 1, 1, 1],
    [2, 0, 2, 1, 1, 1, 1, 1],
    [2, 2, 2, 3, 3, 3, 1, 4],
    [2, 5, 5, 3, 5, 3, 3, 4],
    [2, 2, 5, 5, 5, 3, 4, 4],
    [2, 2, 5, 6, 6, 6, 4, 4],
    [2, 2, 7, 6, 6, 4, 4, 4]
]

// takes the color map and returns a 2D array of cells
const sampleBoard: boardType = sampleColorMap.map(row => row.map((c): cellType => {
    return {
        color: c,
        playerStatus: "valid",
        realStatus: "invalid",
        causes: []
    }
}))

const invalidateCellsInRow = (rowIndex: number, columnIndex: number, board: cellType[][]) => {
    board[rowIndex].forEach((cell, cidx) => {
        if (cidx !== columnIndex && cell.playerStatus !== "star") {
            cell.playerStatus = "invalid";
            cell.causes.push([rowIndex, columnIndex])
        }
    })
}

const invalidateCellsInColumn = (rowIndex: number, columnIndex: number, board: cellType[][]) => {
    // invalidate everything in same column
    board.forEach((row, ridx) => {
        if (ridx !== rowIndex && row[columnIndex].playerStatus !== "star") {
            row[columnIndex].playerStatus = "invalid";
            row[columnIndex].causes.push([rowIndex, columnIndex]);
        }
    })
}

const invalidateDiagonalCells = (rowIndex: number, columnIndex: number, board: cellType[][]) => {
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    directions.forEach(([drow, dcol]) => {
        const ridx = rowIndex + drow;
        const cidx = columnIndex + dcol;
        if (ridx >= 0 && ridx < board.length && cidx >= 0 && cidx < board.length) {
            if (board[ridx][cidx].playerStatus !== "star") {
                board[ridx][cidx].playerStatus = "invalid";
                board[ridx][cidx].causes.push([rowIndex, columnIndex]);
            }
        }
    })
}

const invalidateCellsOfSameColor = (rowIndex: number, columnIndex: number, board: cellType[][]) => {
    board.forEach((row, ridx) => {
        row.forEach((cell, cidx) => {
            if (cell.color === board[rowIndex][columnIndex].color && cell.playerStatus !== "star") {
                if (ridx !== rowIndex || cidx !== columnIndex) {
                    cell.playerStatus = "invalid";
                    cell.causes.push([rowIndex, columnIndex]);
                }
            }
        })
    })
}


// react component of the game board
function Board() {
    // using board as a state variable
    const [board, setBoard] = useState(sampleBoard);

    // updates the board when a cell is clicked
    const onCellClick = useCallback((rowIndex: number, columnIndex: number): void => {
        setBoard((b): boardType => {
            const newBoard: boardType = JSON.parse(JSON.stringify(b));
            const clickedCell = newBoard[rowIndex][columnIndex];
            const currentStatus = clickedCell.playerStatus;
            const nextStatus = playerStatusTransitions[currentStatus];
            clickedCell.playerStatus = nextStatus;

            if (nextStatus === "invalid") { // transition from valid to invalid
                clickedCell.playerStatus = "invalid";
                clickedCell.causes.push("human");
            } else if (nextStatus === "star") { // transition from invalid to star
                clickedCell.causes = [];

                // invalidate everything in same row
                invalidateCellsInRow(rowIndex, columnIndex, newBoard);

                // invalidate everything in same column
                invalidateCellsInColumn(rowIndex, columnIndex, newBoard);

                // invalidates same-colored cells
                invalidateCellsOfSameColor(rowIndex, columnIndex, newBoard);

                // invalidate anything diagonally touching the clicked cell
                invalidateDiagonalCells(rowIndex, columnIndex, newBoard);

            } else { // transition from star to valid
                newBoard.forEach((row) => {
                    row.forEach((cell) => {
                        cell.causes = cell.causes.filter(c => !(_.isEqual(c, [rowIndex, columnIndex])))
                        if (cell.causes.length === 0 && cell.playerStatus === "invalid") {
                            cell.playerStatus = "valid";
                        }
                    })
                })
            }

            return newBoard;
        })
    }, [])

    return (
        // style board to be an nxn grid
        <div className="board" style={{ gridTemplateColumns: `repeat(${board.length}, 1fr)`, gridTemplateRows: `repeat(${board.length}, 1fr)` }}>
            {
                // 2 layers of mapping
                board.map((row, rowIndex) => row.map((cell, columnIndex) => {
                    // cell props:
                    // key (calculated by treating the 2d array as a 1d array)
                    // cell: cellType
                    // updatePlayerStatus: called when the cell is clicked
                    return <Cell key={rowIndex * board.length + columnIndex}
                        color={cell["color"]}
                        realStatus={cell["realStatus"]}
                        playerStatus={cell["playerStatus"]}
                        updatePlayerStatus={() => onCellClick(rowIndex, columnIndex)}></Cell>
                }))
            }
        </div>
    )
}

export default Board;