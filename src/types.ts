// status of each individual cell
type playerStatusType = "valid" | "invalid" | "star"
type realStatusType = "invalid" | "star"
type causeType = null | "human" | [number, number]

// type for cells
type cellType = {
    color: number,
    playerStatus: playerStatusType,
    realStatus: realStatusType,
    cause: causeType,
}

// props that need to be passed in when creating a Cell component
type cellPropType = {
    key: number,
    color: number,
    playerStatus: playerStatusType,
    realStatus: realStatusType,
    updatePlayerStatus: () => void
}

// type for a board, which is a 2D array of cells
type boardType = cellType[][];

export type { playerStatusType, realStatusType, cellType, cellPropType, boardType };