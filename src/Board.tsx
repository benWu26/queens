import { useCallback, useState } from "react";
import Cell from "./Cell";
import { cellType, boardType, playerStatusType } from "./types"

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
        realStatus: "invalid"
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
            const currentStatus = newBoard[rowIndex][columnIndex].playerStatus;
            newBoard[rowIndex][columnIndex].playerStatus = playerStatusTransitions[currentStatus];
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
                    return <Cell key={rowIndex * board.length + columnIndex} cell={cell} updatePlayerStatus={() => onCellClick(rowIndex, columnIndex)}></Cell>
                }))
            }
        </div>

    )
}

export default Board;