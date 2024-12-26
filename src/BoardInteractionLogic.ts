import { cellType, boardType, playerStatusType} from "./types"
import _ from "lodash";
import rfdc from 'rfdc';
const clone = rfdc();


// ------------------------HELPER STUFF----------------------------
// status transitions when a player clicks on a cell
const playerStatusTransitions: Record<playerStatusType, playerStatusType> = {
    "valid": "invalid",
    "invalid": "star",
    "star": "valid"
}


//create an array of tuples of [row, column, valid/invalid]
export interface event {//each event is a row, column, and validity
    xCoord: number;
    yCoord: number;
    validity: playerStatusType;
}
type eventgroup = event[];  //for when a group of events happen in dragging(at least one event is needed)

type eventstack = eventgroup[]; //creates a stack of event groups

let eventGroup: eventgroup = [];
let eventStack: eventstack = []; //creates an empty stack to keep track of all event groups. THIS WILL BE WHAT THE UNDO BUTTON LOOKS AT. 




/**
 * Given a board, and the coordinates of a cell that a player is clicking on, this function will
 * return a Set of all cells in the board that are either in the same row, column, or color group
 * (but not in the same row and column) as the given cell.
 * @param {number} rowIndex
 * @param {number} columnIndex
 * @param {boardType} board
 * @returns {Set<cellType>}
 */
const getInvalidCells = (rowIndex: number, columnIndex: number, board: boardType) => { //dots coming from queens
    const invalidCells = new Set<cellType>();
    board.forEach((row, ridx) => {
        row.forEach((cell, cidx) => {
            if ((ridx === rowIndex) !== (cidx === columnIndex)) {
                invalidCells.add(cell);
            }
            if ((ridx + 1 === rowIndex || ridx - 1 === rowIndex) && (cidx + 1 === columnIndex || cidx - 1 === columnIndex)) {
                invalidCells.add(cell);
            }
            if (cell.color === board[rowIndex][columnIndex].color && (ridx !== rowIndex || cidx !== columnIndex)) {
                invalidCells.add(cell);
            }
        })
    })
    return invalidCells;
}

/**
 * Sets cell.playerStatus to "invalid" if it's not already "star", and adds the given coordinates to cell.causes.
 * @param {number} rowIndex
 * @param {number} columnIndex
 * @param {cellType} cell
 */
const autoInvalidateOneCell = (rowIndex: number, columnIndex: number, cell: cellType) => {
    if (cell.playerStatus !== "star") {
        cell.playerStatus = "invalid";
        cell.causes.push([rowIndex, columnIndex]);
    }
}

/**
 * Given a board, and the coordinates of a cell that a player is clicking on, this function will
 * set the playerStatus of all cells in the board that are either in the same row, column, or color
 * group (but not in the same row and column) to "invalid", and add the given coordinates to their
 * causes.
 * @param {number} rowIndex
 * @param {number} columnIndex
 * @param {boardType} board
 */
const autoInvalidateMultipleCells = (rowIndex: number, columnIndex: number, board: boardType) => {
    const invalidCells = getInvalidCells(rowIndex, columnIndex, board);
    invalidCells.forEach((cell) => {
        autoInvalidateOneCell(rowIndex, columnIndex, cell);
    })
}

/**
 * Given a board, and the coordinates of a cell that is being un-invalidated, this function will
 * remove the given coordinates from the causes of all other cells in the board.
 * If a cell has no remaining causes, it will be set to "valid" status.
 * @param {number} rowIndex
 * @param {number} columnIndex
 * @param {boardType} board
 */

const removeInvalidationCause = (rowIndex: number, columnIndex: number, board: boardType) => {
    board.forEach((row) => {
        row.forEach((cell) => {
            cell.causes = cell.causes.filter(c => !(_.isEqual(c, [rowIndex, columnIndex])))
            if (cell.causes.length === 0 && cell.playerStatus === "invalid") {
                cell.playerStatus = "valid";
            }
        })
    })
}

// ---------------------------------------- RESPONSES TO USER EVENTS (CLICK, DRAG) ---------------------------------------------------------

/**
 * Given a board, and the coordinates of a cell that a player is dragging over, this function will
 * update the board based on the rules of the game. If the cell is currently valid, it will be
 * set to "invalid" status, and the cause will be labeled as "human". If the cell is currently
 * invalid or a star, it will be left alone. This is used when a player is dragging the mouse
 * over the board, and we want to invalidate cells as the mouse moves over them.
 * @param {number} rowIndex
 * @param {number} columnIndex
 * @param {boardType} board
 * @returns {boardType}
 */
const invalidateCellOnDrag = (rowIndex: number, columnIndex: number, board: boardType): boardType => {
    //console.log("invalidateCellOnDrag called")

    if (board[rowIndex][columnIndex].playerStatus === "valid") {
        //console.log("if branch taken");
        const newBoard = clone(board);
        newBoard[rowIndex][columnIndex].playerStatus = "invalid"
        newBoard[rowIndex][columnIndex].causes.push("human");


        //create event 
        const currentEvent: event = {//save the event as (x,y, currentStatus) because the previous thingy needs to be saved to be undoed
            xCoord: rowIndex,
            yCoord: columnIndex,
            validity: "valid",
        };

        //adds to group
        pushEventGroup(currentEvent);
        

        return newBoard;
    } else {
        return board;
    }
}


/**
 * Given a board, and the coordinates of a cell that a player is clicking on, this function will
 * update the board based on the rules of the game. If the cell is currently valid, it will be
 * set to "invalid". If the cell is currently invalid, it will be set to "star", and all other
 * cells in the same row, column, color, or diagonal will be set to "invalid". If the cell is
 * currently a star, it will be set to "valid", and all cells that were invalidated SOLELY because of
 * it will be set back to "valid". This function returns the updated board.
 * @param {number} rowIndex
 * @param {number} columnIndex
 * @param {boardType} board
 */
const updateBoard = (rowIndex: number, columnIndex: number, board: boardType) => { //UPDATE BOARD GETS CALLED WHEN CLICKED ONA A CELL
    const newBoard: boardType = clone(board); 
    const clickedCell = newBoard[rowIndex][columnIndex];
    const currentStatus = clickedCell.playerStatus;
    const nextStatus = playerStatusTransitions[currentStatus];
    clickedCell.playerStatus = nextStatus;

    const currentEvent: event = {//save the event as (x,y, currentStatus) because the previous thingy needs to be saved to be undoed
        xCoord: rowIndex,
        yCoord: columnIndex,
        validity: currentStatus,
    };

    //initlizize a group(this case itll just be a single event tho)
    let singleEvent:eventgroup = [];

    //add to eventgroup as a single shit
    singleEvent.push(currentEvent);

    //add the new group to the overall array
    eventStack.push(singleEvent);



    if (nextStatus === "invalid") { // transition from valid to invalid
        clickedCell.causes.push("human");
    } else if (nextStatus === "star") { // transition from invalid to star
        clickedCell.causes = [];

        autoInvalidateMultipleCells(rowIndex, columnIndex, newBoard);

    } else { // transition from star to valid
        removeInvalidationCause(rowIndex, columnIndex, newBoard);
    }

    return newBoard;
}


// ---------------------------- UNDO BUTTON LOGIC -------------------------------

const undoEvent = (board: boardType) => { //you don't need x and y because its being read in the eventgroup
    if(eventStack.length === 0 ){ //if empty, do nothing
        return board;
    }
    else{ //if not, actually undo


        //clone a new board
        const newBoard: boardType = clone(board);
    
        //read latest event group
        let currentEventGroup:eventgroup = eventStack[eventStack.length - 1];


        for (let i = 0; i < currentEventGroup.length; i++) { //for each element in the event group
            const rowIndex = currentEventGroup[i].xCoord;
            const columnIndex = currentEventGroup[i].yCoord;

            //grab the cell using the specific indeces
            const cell = newBoard[rowIndex][columnIndex];

            const undoState = currentEventGroup[i].validity;

            cell.playerStatus = undoState;

            //reads the undo state and turns it into what cell used to (along with the changes)
            if(undoState === "invalid"){ 
                cell.causes.push("human");
                removeInvalidationCause(rowIndex, columnIndex, newBoard);
            }
            else if (undoState === "star") { 
                cell.causes = [];
            
                autoInvalidateMultipleCells(rowIndex, columnIndex, newBoard);

                
            }

            else{
                cell.causes = [];
            }

        }

        //pop off the array
        eventStack.pop();

        //at the end return the new board
        return newBoard;
    }
    
}

//EVENT GROUP HELPER FUNCTIONS

//create a event group 
const emptyEventGroup = () => {
    eventGroup = []; //empties group 
}

const pushEventGroup = (currentEvent: event) => {
    eventGroup.push(currentEvent);
    console.log("added " + currentEvent);
}


const addGroupToStack = () => { //when mouseup, stop adding to group and push into main stack
    eventStack.push(eventGroup);
}


export {invalidateCellOnDrag, updateBoard, undoEvent, getInvalidCells, autoInvalidateMultipleCells, removeInvalidationCause, emptyEventGroup, pushEventGroup, addGroupToStack, }