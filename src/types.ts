// status of each individual cell
type playerStatusType = "valid" | "invalid" | "star"
type realStatusType = "invalid" | "star"
type coordinateType = [number, number]
type causesType = ("human" | coordinateType)[]

// type for cells
type cellType = {
    color: number,
    playerStatus: playerStatusType,
    realStatus: realStatusType,
    causes: causesType,
}

// props that need to be passed in when creating a Cell component
type cellPropType = {
    key: number,
    color: number,
    playerStatus: playerStatusType,
    updatePlayerStatusClick: () => void,
    updatePlayerStatusDrag: () => void
}

type boardPropType = {
    board: boardType
}

// type for a board, which is a 2D array of cells
type boardType = cellType[][];

type nodeLabelType = {
    size: number,
    cells: number[]
}

// type boardGraphType = {
//     vertices: graphVertexType[],
//     edges: Set<[number, number]>
// }

export type { playerStatusType, realStatusType, cellType, cellPropType, boardType, boardPropType, nodeLabelType };