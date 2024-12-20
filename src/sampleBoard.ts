import { boardType, cellType } from "./types"

// SAMPLE MAP + BOARD
// maps out the color of each cell on the board
const sampleColorMap = [
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 1, 1, 1, 2, 2, 2],
    [0, 0, 0, 0, 1, 1, 1, 3, 3, 2],
    [0, 4, 4, 0, 1, 5, 3, 3, 3, 3],
    [0, 0, 4, 4, 6, 5, 5, 5, 3, 3],
    [0, 0, 4, 4, 6, 5, 5, 3, 3, 3],
    [4, 4, 4, 4, 6, 6, 5, 5, 3, 3],
    [4, 4, 7, 7, 6, 6, 6, 3, 3, 3],
    [7, 7, 7, 7, 7, 6, 8, 9, 9, 9],
    [7, 7, 7, 7, 7, 7, 8, 8, 8, 8],
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