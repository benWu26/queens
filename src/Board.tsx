import { useCallback, useState, useRef } from "react";
import Cell from "./Cell";
import {boardType, boardPropType} from "./types"
import _ from "lodash";
import { updateBoard, invalidateCellOnDrag, undoEvent, resetBoardState } from "./BoardInteractionLogic";
import {validateSolution} from "./BoardSolver"


function Board(props: boardPropType) {
    // using board as a state variable
    const [board, setBoard] = useState(props.board);

    // ref variable for detecting if mouse is pressed or not
    const mouseDownRef = useRef(false);

    const suppressMouseRef = useRef(false);

    // updates the board when a cell is clicked
    const onCellClick = useCallback((rowIndex: number, columnIndex: number): void => {
        setBoard((b): boardType => updateBoard(rowIndex, columnIndex, b));
    }, [])

    // when the mouse is dragged over a cell, invalidates the cell if the mouse is pressed
    const onDrag = useCallback((rowIndex: number, columnIndex: number): void => {
        if (mouseDownRef.current && !suppressMouseRef.current) {
            setBoard((b): boardType => invalidateCellOnDrag(rowIndex, columnIndex, b));
        }
    }, []);

    // when the mouse moves out of the board, we want to set mouseDownRef to false.
    // when the mouse re-enters the board, we want to see 



    //BEN FUNCTION FOR UNDO
    const onButtonClick = (): void => {
        setBoard((b): boardType => undoEvent(b));
    }

    const onResetButtonClick = useCallback(
        () => {setBoard((b): boardType => resetBoardState(b));}, []
    )


    return (
        // style board to be an nxn grid
        <div className="board-container">
            <div className="board" style={{ "--grid-size": `repeat(${board.length}, 1fr)` } as React.CSSProperties} 
            onMouseDown={() => {
                suppressMouseRef.current = true;
                mouseDownRef.current = true;
                setTimeout(() => {
                    suppressMouseRef.current = false;
                }, 50);
            }} 
            onMouseUp={() => {mouseDownRef.current = false}}
            onMouseLeave={() => {mouseDownRef.current = false}}
            onMouseEnter={(e) => {
                // if the left mouse button (corresponding to the 0th position of the binary string) is pressed:
                if (e.buttons & (1)) {
                    mouseDownRef.current = true;

                    // dispatch a mouseOver event to the cell being pointed at
                    const selectedCell = document.elementFromPoint(e.clientX, e.clientY);
                    if (selectedCell instanceof HTMLElement) {
                        const event = new MouseEvent('mouseover', {
                            view: window,
                            bubbles: true,
                            cancelable: true,
                            clientX: e.clientX,
                            clientY: e.clientY
                        });
                        selectedCell.dispatchEvent(event);
                    }
                } 

                
            }}>
                {
                    // 2 layers of mapping
                    board.map((row, rowIndex) => row.map((cell, columnIndex) => {
                        // cell props:
                        // key (calculated by treating the 2d array as a 1d array)
                        // cell: cellType
                        // updatePlayerStatus: called when the cell is clicked
                        return <Cell key={rowIndex * board.length + columnIndex}
                            color={cell.color}
                            playerStatus={cell.playerStatus}
                            updatePlayerStatusClick={() => onCellClick(rowIndex, columnIndex)}
                            updatePlayerStatusDrag={() => onDrag(rowIndex, columnIndex)}
                            ></Cell>
                            
                    }))
                }
            </div>
            <p>{validateSolution(board) ? "complete" : "incomplete"}</p>

            {/* The Undo button */}
            <button onClick = {onButtonClick}> 
                UNDO
            </button>

            <button onClick={onResetButtonClick}>
                RESET
            </button>
        </div>
    )
}

export default Board;