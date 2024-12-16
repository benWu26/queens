import { useState } from "react";
import Cell from "./Cell";
import { playerStatusType, realStatusType, cellType, boardType } from "./types"


// type BoardType = {
//     size: number,
//     stars: number,
//     colorMap: number[][],
//     playerStatusMap: playerStatusType[][],
// }
// const defaultBoard: BoardType = {
//     size: 8,
//     stars: 1,
//     colorMap: [
//         [0, 0, 0, 1, 1, 1, 1, 1],
//         [2, 0, 2, 1, 1, 1, 1, 1],
//         [2, 0, 2, 1, 1, 1, 1, 1],
//         [2, 2, 2, 3, 3, 3, 1, 4],
//         [2, 5, 5, 3, 5, 3, 3, 4],
//         [2, 2, 5, 5, 5, 3, 4, 4],
//         [2, 2, 5, 6, 6, 6, 4, 4],
//         [2, 2, 7, 6, 6, 4, 4, 4]
//     ],
//     playerStatusMap: Array(8).fill(0).map(() => Array(8).fill("valid")),

// }

const colorMap = [
    [0, 0, 0, 1, 1, 1, 1, 1],
    [2, 0, 2, 1, 1, 1, 1, 1],
    [2, 0, 2, 1, 1, 1, 1, 1],
    [2, 2, 2, 3, 3, 3, 1, 4],
    [2, 5, 5, 3, 5, 3, 3, 4],
    [2, 2, 5, 5, 5, 3, 4, 4],
    [2, 2, 5, 6, 6, 6, 4, 4],
    [2, 2, 7, 6, 6, 4, 4, 4]
]


const sampleBoard = colorMap.map(row => row.map((c): cellType => {
    return {
        color: c,
        playerStatus: "valid",
        realStatus: "invalid"
    }
}))



function Board() {
    const [board, setBoard] = useState(sampleBoard);

    return (
        <div className="board" style={{ gridTemplateColumns: `repeat(${board.length}, 1fr)`, gridTemplateRows: `repeat(${board.length}, 1fr)` }}>
            {
                board.map((row, rowIndex) => row.map((cell, columnIndex) => {
                    return <Cell row={rowIndex} column={columnIndex} cell={cell}></Cell>
                }))
            }
        </div>

    )
}

export default Board;