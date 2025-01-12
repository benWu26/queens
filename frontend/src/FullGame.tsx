import {useState, useEffect, useCallback } from 'react'
import Board from './Board.tsx'
import { boardType, constructBoardFromColorMap } from 'shared'
import "./index.css"
import Slider from "@mui/material/Slider"

function FullGame() {
    const [board, setBoard] = useState<boardType | null>(null);
    const [loading, setLoading] = useState(true);
    const [boardSize, setBoardSize] = useState(8);
    const [difficulty, setDifficulty] = useState(5);
    const [autoPlace, setAutoPlace] = useState(false);

    const getBoard = useCallback(() => { 
        setLoading(true); 
        setBoard(null);  

        setTimeout(() => {
            const fetchUrl = `/api/generate?size=${boardSize}&percentile=${difficulty/10}`
            console.log(fetchUrl)
            fetch(fetchUrl).then(
                response => response.json()
            ).then(
                (colorMap: number[][]) => {
                    const newBoard = constructBoardFromColorMap(colorMap);
                    setBoard(newBoard);
                    setLoading(false);
                }
            )
        }, 0);
    }, [boardSize, difficulty]);

    useEffect(() => { getBoard() }, [])

    return (
        <div className="full-game">
            {/* displays the board if it's loaded, otherwise, displays a loading message */}
            <div id="placeholder">
                {loading ? <div className='loading-message'>loading...</div> : <>
                <Board board={board!} autoPlace={autoPlace}></Board>
                
                </>}
                
            </div>

            {/* if the board is loaded, display these components as well. */}
            {loading ? null : 
            <div className='generate-puzzles'>
                {/* select the desired board size */}
                <div className='slider-label'>
                    board size: {boardSize}
                </div>
                <Slider
                    value={boardSize}
                    min={4}
                    max={10}
                    step={1}
                    onChange={(e, value) => setBoardSize(value as number)}
                    valueLabelDisplay="off"
                    aria-labelledby="board-size-slider"
                />
                <div className='slider-label'>
                    difficulty: {difficulty}
                </div>
                <Slider
                    value={difficulty}
                    min={0}
                    max={10}
                    step={1}
                    onChange={(e, value) => setDifficulty(value as number)}
                    valueLabelDisplay="off"
                    aria-labelledby="difficulty-slider"
                />
                {/* get a new board */}
                <button
                    onClick={getBoard}>
                    generate new board
                </button>
                <br />
                {/* toggle dot auto placement */}
                <label className='x-switch'>
                    <input type="checkbox" checked={autoPlace} onChange={(e) => setAutoPlace(e.target.checked)}/>
                    auto place dots
                </label>

            </div>
            
            }   
        </div>
    )
}

export default FullGame