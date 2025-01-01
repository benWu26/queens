import { boardType, cellType } from "./types"

// SAMPLE MAP + BOARD
// maps out the color of each cell on the board
const sampleColorMap = [
    [0, 0, 0, 1, 1], 
    [0, 0, 0, 0, 0],
    [0, 2, 2, 0, 0],
    [0, 2, 3, 3, 3],
    [4, 4, 4, 3, 3]
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