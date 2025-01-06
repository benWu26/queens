import { useCallback, useState, useRef, useMemo, useEffect } from "react";
import Cell from "./Cell";
import {boardType, boardPropType} from "../../shared/types"
import _ from "lodash";

import { updateBoard, invalidateCellOnDrag, undoEvent,  emptyEventGroup, addGroupToStack, resetBoardState}  from "../../shared/BoardInteractionLogic";

import rfdc from "rfdc";
const clone = rfdc();

import {validateSolution} from "./BoardSolver"
import Stopwatch from "./Stopwatch";


function Board(props: boardPropType) {
    
    // using board as a state variable
    const [board, setBoard] = useState(clone(props.board));
    const [didBoardChange, setDidBoardChange] = useState(false);

    useEffect(() => {
        setBoard(clone(props.board))
        setDidBoardChange(true);
    }, [props.board])

    useEffect(() => {
        if (didBoardChange) {
            setDidBoardChange(false)
        }
    }, [didBoardChange])




    const borders = useMemo(() => {
        return props.board.map((row, rowIndex) => row.map((cell, columnIndex) => {
            console.log("border recalculated");
            let bottomBorder = false;
            let rightBorder = false;
            let topBorder = false;
            let leftBorder = false;
    
            if (rowIndex % 2 === 0) {
                if (rowIndex > 0) {
                    if (cell.color !== props.board[rowIndex-1][columnIndex].color) {
                        topBorder = true;
                    }
                }
    
                if (rowIndex < props.board.length - 1){
                    if (cell.color !== props.board[rowIndex+1][columnIndex].color) {
                        bottomBorder = true;
                    }
                }
            }
    
            if (columnIndex % 2 === 0) {
                if (columnIndex > 0) {
                    if (cell.color !== props.board[rowIndex][columnIndex-1].color) {
                        leftBorder = true;
                    }
                }
    
                if (columnIndex < props.board.length - 1) {
                    if (cell.color !== props.board[rowIndex][columnIndex+1].color) {
                        rightBorder = true;
                    }
                }
            }
            
            return {bottomBorder, rightBorder, topBorder, leftBorder};
        }));
    }, [props.board]);

    // ref variable for detecting if mouse is pressed or not
    const mouseDownRef = useRef(false);

    const suppressMouseRef = useRef(false);

    // updates the board when a cell is clicked
    const onCellClick = useCallback((rowIndex: number, columnIndex: number): void => {
        setBoard((b): boardType => updateBoard(rowIndex, columnIndex, b, props.autoPlace));
    }, [props.autoPlace])

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

                //create a new event group/empties
                emptyEventGroup();
                                              

            }} 

            onMouseUp={() => {
                mouseDownRef.current = false;
                  addGroupToStack(); //adds to the stack;
                }
            }
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
                        const cellBorder = borders[rowIndex][columnIndex];
                        return <Cell key={rowIndex * board.length + columnIndex}
                            color={cell.color}
                            playerStatus={cell.playerStatus}
                            rightBorder={cellBorder.rightBorder}
                            bottomBorder={cellBorder.bottomBorder}
                            leftBorder = {cellBorder.leftBorder}
                            topBorder = {cellBorder.topBorder}
                            updatePlayerStatusClick={() => onCellClick(rowIndex, columnIndex)}
                            updatePlayerStatusDrag={() => onDrag(rowIndex, columnIndex)}
                            ></Cell>
                            
                    }))
                }
            </div>

            <p>{validateSolution(board) ? "Congratulations!" : null}</p>

            {/* The Undo button */}
            <button onClick = {onButtonClick}> 
                UNDO
            </button>

            <button onClick={onResetButtonClick}>
                RESET
            </button>
            <Stopwatch isRunning={!validateSolution(board)} reset={didBoardChange}></Stopwatch>
        </div>
    )
}

export default Board;