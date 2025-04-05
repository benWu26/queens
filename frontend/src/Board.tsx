import { useCallback, useState, useRef, useMemo, useEffect } from "react";
import Cell from "./Cell";
import { boardType, boardPropType } from "shared";
import _ from "lodash";

import { updateBoard, updateCellOnDrag, undoEvent, emptyEventGroup, resetBoardState, addGroupToStack } from "shared";

import rfdc from "rfdc";
const clone = rfdc();

import { validateSolution } from "shared";
import Stopwatch from "./Stopwatch";

function Board(props: boardPropType) {
    // using board as a state variable
    const [board, setBoard] = useState(clone(props.board));

    // used as a reset signal for the stopwatch
    const [didBoardChange, setDidBoardChange] = useState(false);

    // ref variable for detecting if mouse is pressed or not
    const mouseDownRef = useRef(false);

    // ref variable for detecting if mouse is being dragged
    const mouseDragRef = useRef(false);

    // ref variable for cell toggle mode
    // this is set when the mouse is pressed and the cell is valid or invalid
    // this is used for when we are dragging to determine whether we should invalidate or validate the cell
    const invalidateModeRef = useRef(true);

    // when the board passed in from props changes, we want to set the board and reset the stopwatch
    useEffect(() => {
        setBoard(clone(props.board));
        setDidBoardChange(true);
    }, [props.board]);

    // prevents stopwatch from perpetually resetting
    useEffect(() => {
        if (didBoardChange) {
            setDidBoardChange(false);
        }
    }, [didBoardChange]);

    // determines which cell borders separate two different colors
    const borders = useMemo(() => {
        return props.board.map((row, rowIndex) =>
            row.map((cell, columnIndex) => {
                let bottomBorder = false;
                let rightBorder = false;
                let topBorder = false;
                let leftBorder = false;

                if (rowIndex % 2 === 0) {
                    if (rowIndex > 0) {
                        if (cell.color !== props.board[rowIndex - 1][columnIndex].color) {
                            topBorder = true;
                        }
                    }

                    if (rowIndex < props.board.length - 1) {
                        if (cell.color !== props.board[rowIndex + 1][columnIndex].color) {
                            bottomBorder = true;
                        }
                    }
                }

                if (columnIndex % 2 === 0) {
                    if (columnIndex > 0) {
                        if (cell.color !== props.board[rowIndex][columnIndex - 1].color) {
                            leftBorder = true;
                        }
                    }

                    if (columnIndex < props.board.length - 1) {
                        if (cell.color !== props.board[rowIndex][columnIndex + 1].color) {
                            rightBorder = true;
                        }
                    }
                }

                return { bottomBorder, rightBorder, topBorder, leftBorder };
            })
        );
    }, [props.board]);

    // --------------------CALLBACKS PASSED INTO EACH CELL-------------------------------

    // updates the board when a cell is clicked
    const onCellClick = useCallback(
        (rowIndex: number, columnIndex: number): void => {
            if (!mouseDragRef.current) {
                setBoard((b): boardType => updateBoard(rowIndex, columnIndex, b, props.autoPlace));
            }
        },
        [props.autoPlace]
    );

    // when the mouse is dragged over a cell, invalidates the cell if the mouse is pressed
    const onCellDrag = useCallback(
        (
            board: boardType,
            rowIndex: number,
            columnIndex: number,
            toggleModeRef: React.MutableRefObject<boolean>
        ): void => {
            if (mouseDownRef.current && !mouseDragRef.current) {
                if (board[rowIndex][columnIndex].playerStatus === "valid") {
                    toggleModeRef.current = true;
                } else if (board[rowIndex][columnIndex].playerStatus === "invalid") {
                    toggleModeRef.current = false;
                }
            }
            if (mouseDownRef.current) {
                mouseDragRef.current = true;
                setBoard((b): boardType => updateCellOnDrag(rowIndex, columnIndex, b, toggleModeRef.current));
            }
        },
        []
    );

    // -------------------CALLBACKS FOR BOARD-LEVEL EVENTS-------------------------------
    const onBoardMouseDown = () => {
        mouseDownRef.current = true;

        //create a new event group/empties
        emptyEventGroup();
    };

    const onBoardMouseUp = () => {
        mouseDownRef.current = false;
        mouseDragRef.current = false;

        addGroupToStack(); //adds to the stack;
    };

    const onBoardMouseEnter = (e: React.MouseEvent) => {
        if (e.buttons & 1) {
            mouseDownRef.current = true;

            // dispatch a mouseOver event to the cell being pointed at
            const selectedCell = document.elementFromPoint(e.clientX, e.clientY);
            if (selectedCell instanceof HTMLElement) {
                const event = new MouseEvent("mouseover", {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    clientX: e.clientX,
                    clientY: e.clientY,
                });
                selectedCell.dispatchEvent(event);
            }
        }
    };

    // -------------------OTHER BUTTONS-----------------------------------
    //BEN FUNCTION FOR UNDO
    const onUndoButtonClick = useCallback((): void => {
        setBoard((b): boardType => undoEvent(b));
    }, []);

    // called when clicking the reset button
    const onResetButtonClick = useCallback(() => {
        setBoard((b): boardType => resetBoardState(b));
    }, []);

    // ---------------------COMPONENT TSX--------------------------------
    return (
        // style board to be an nxn grid
        <div className="board-container">
            <div
                className="board"
                style={{ "--grid-size": `repeat(${board.length}, 1fr)` } as React.CSSProperties}
                onMouseDown={onBoardMouseDown}
                onMouseUp={onBoardMouseUp}
                onTouchEnd={e => {
                    e.preventDefault();
                    onBoardMouseUp();
                }}
                onMouseLeave={() => {
                    mouseDownRef.current = false;
                }}
                onMouseEnter={e => onBoardMouseEnter(e)}
                onTouchMove={e => {
                    const touch = e.touches[0];
                    if (touch) {
                        onBoardMouseEnter({
                            buttons: 1,
                            clientX: touch.clientX,
                            clientY: touch.clientY,
                        } as React.MouseEvent);
                    }
                }}
            >
                {
                    // 2 layers of mapping
                    board.map((row, rowIndex) =>
                        row.map((cell, columnIndex) => {
                            const cellBorder = borders[rowIndex][columnIndex];
                            return (
                                <Cell
                                    key={rowIndex * board.length + columnIndex}
                                    color={cell.color}
                                    playerStatus={cell.playerStatus}
                                    rightBorder={cellBorder.rightBorder}
                                    bottomBorder={cellBorder.bottomBorder}
                                    leftBorder={cellBorder.leftBorder}
                                    topBorder={cellBorder.topBorder}
                                    updatePlayerStatusClick={() => onCellClick(rowIndex, columnIndex)}
                                    updatePlayerStatusDrag={() =>
                                        onCellDrag(board, rowIndex, columnIndex, invalidateModeRef)
                                    }
                                ></Cell>
                            );
                        })
                    )
                }
            </div>

            <p>{validateSolution(board) ? "Congratulations!" : null}</p>

            {/* The Undo button */}
            <button onClick={onUndoButtonClick}>UNDO</button>

            {/* reset button */}
            <button onClick={onResetButtonClick}>RESET</button>

            {/* Used for timing how long the player takes to solve */}
            <Stopwatch isRunning={!validateSolution(board)} reset={didBoardChange}></Stopwatch>
        </div>
    );
}

export default Board;
