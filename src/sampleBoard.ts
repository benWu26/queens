import { boardType, cellType } from "./types"

// SAMPLE MAP + BOARD
// maps out the color of each cell on the board
const sampleColorMap = [
    [0, 0, 0, 1, 1, 1, 2, 2],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0],
    [3, 3, 4, 4, 4, 5, 0, 0],
    [3, 3, 5, 5, 5, 5, 0, 0],
    [3, 3, 3, 3, 3, 5, 6, 6],
    [6, 6, 3, 3, 6, 6, 6, 6],
    [6, 6, 6, 6, 6, 6, 6, 7]
]

// takes the color map and returns a 2D array of cells
const sampleBoard: boardType = sampleColorMap.map((row, ridx) => row.map((c, cidx): cellType => {
    return {
        color: c,
        playerStatus: "valid",
        realStatus: "invalid",
        causes: [],
        row: ridx,
        column: cidx
    }
}))

export default sampleBoard;