import { boardType, cellType } from "./types"

// SAMPLE MAP + BOARD
// maps out the color of each cell on the board
const sampleColorMap = [
    [0, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 2, 2, 0, 0, 1, 1],
    [0, 0, 0, 2, 2, 2, 1, 1],
    [0, 0, 2, 2, 2, 3, 1, 1],
    [0, 4, 2, 2, 3, 3, 3, 1],
    [5, 5, 6, 6, 3, 3, 3, 1],
    [5, 5, 5, 6, 6, 7, 1, 1],
    [5, 5, 5, 6, 6, 7, 7, 7]
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

export default sampleBoard;