import { boardType, cellType } from "./types"

// SAMPLE MAP + BOARD
// maps out the color of each cell on the board
const sampleColorMap = [
    [0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 2, 2, 1, 1, 1],
    [0, 0, 0, 2, 1, 1, 1, 1],
    [0, 4, 3, 2, 2, 1, 2, 2],
    [4, 4, 3, 2, 2, 2, 2, 2],
    [4, 5, 5, 5, 5, 2, 5, 6],
    [4, 4, 5, 5, 5, 5, 5, 6],
    [4, 4, 4, 7, 5, 5, 6, 6],
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