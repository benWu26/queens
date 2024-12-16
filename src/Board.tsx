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
        cause: null
    }
}))

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
                clickedCell.cause = "human";
            } else if (nextStatus === "star") { // transition from invalid to star

                // invalidate everything in same row
                newBoard[rowIndex].forEach((cell, cidx) => {
                    if (cidx !== columnIndex) {
                        if (cell.playerStatus === "valid") {
                            cell.playerStatus = "invalid";
                            cell.cause = [rowIndex, columnIndex];
                        }
                    }
                })

                // invalidate everything in same column
                newBoard.forEach((row, ridx) => {
                    if (ridx !== rowIndex) {
                        if (row[columnIndex].playerStatus === "valid") {
                            row[columnIndex].playerStatus = "invalid";
                            row[columnIndex].cause = [rowIndex, columnIndex];

                        }
                    }
                })

                // invalidate everything of same color
                newBoard.forEach((row, ridx) => {
                    row.forEach((cell, cidx) => {
                        if (cell.color === clickedCell.color) {
                            if (ridx !== rowIndex || cidx !== columnIndex) {
                                if (cell.playerStatus === "valid") {
                                    cell.playerStatus = "invalid";
                                    cell.cause = [rowIndex, columnIndex];
                                }
                            }
                        }
                    })
                })

            } else { // transition from star to valid
                newBoard.forEach((row) => {
                    row.forEach((cell) => {
                        if (_.isEqual(cell.cause, [rowIndex, columnIndex])) {
                            if (cell.playerStatus === "invalid") {
                                cell.playerStatus = "valid";
                                cell.cause = null;
                            }
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
                    return <Cell key={rowIndex * board.length + columnIndex} color={cell["color"]} realStatus={cell["realStatus"]} playerStatus={cell["playerStatus"]} updatePlayerStatus={() => onCellClick(rowIndex, columnIndex)}></Cell>
                }))
            }
        </div>
    )
}

export default Board;