// ----------------------------------------- CELLS -------------------------------------------

// status of each individual cell
type playerStatusType = "valid" | "invalid" | "star" | "error" //added error
type realStatusType = "invalid" | "star"
type coordinateType = [number, number]
type causesType = ("human" | coordinateType)[]

// type for cells
type cellType = {
    color: number,
    playerStatus: playerStatusType,
    realStatus: realStatusType,
    causes: causesType,
    row: number, 
    column: number
}

// props that need to be passed in when creating a Cell component
type cellPropType = {
    key: number,
    color: number,
    playerStatus: playerStatusType,
    topBorder: boolean,
    rightBorder: boolean,
    bottomBorder: boolean,
    leftBorder: boolean
    updatePlayerStatusClick: () => void,
    updatePlayerStatusDrag: () => void
}

// ------------------------------BOARD------------------------------------
// type for a board, which is a 2D array of cells
type boardType = cellType[][];

type boardPropType = {
    board: boardType,
    autoPlace: boolean,
}

type borderType = {
    bottomBorder: boolean,
    topBorder: boolean, 
    leftBorder: boolean,
    rightBorder: boolean
}

export type {borderType}

// -------------------------------------- GRAPH STUFF ---------------------
type nodeLabelType = {
    size: number,
    cells: number[]
}

// -----------RULE BASED SOLVER------------------
type cellGroupType = {
    cells: Set<cellType>,
    resolved: boolean
}

type cellChangeType = [number, number, playerStatusType];
type ruleReturnType = {
    changes: cellChangeType[],
    difficulty: number
}

type ruleFunctionType = (board: boardType, groups: boardGroupsType) => ruleReturnType | false;

type boardGroupsType = {
    rows: cellGroupType[];
    columns: cellGroupType[];
    colorGroups: cellGroupType[];
    
};

export {cellGroupType, cellChangeType, ruleReturnType, ruleFunctionType, boardGroupsType}

// ---------------STOPWATCH------------------------
type stopWatchPropTypes = {
    isRunning: boolean,
    reset: boolean
}

export type {stopWatchPropTypes}

export type { playerStatusType, realStatusType, cellType, 
    cellPropType, boardType, boardPropType, nodeLabelType};