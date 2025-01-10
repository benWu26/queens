import {useState, useEffect, useCallback } from 'react'
import Board from './Board.tsx'
import { boardType, constructBoardFromColorMap } from 'shared'
import "./index.css"

function FullGame() {
    const [board, setBoard] = useState<boardType | null>(null);
    const [loading, setLoading] = useState(true);
    const [boardSize, setBoardSize] = useState(8);
    const [autoPlace, setAutoPlace] = useState(false);

    const getBoard = useCallback(() => { 
        setLoading(true); 
        setBoard(null);  

        setTimeout(() => {
            fetch(`/api/generate?size=${boardSize}`).then(
                response => response.json()
            ).then(
                (colorMap: number[][]) => {
                    const newBoard = constructBoardFromColorMap(colorMap);
                    setBoard(newBoard);
                    setLoading(false);
                }
            )
        }, 0);
    }, [boardSize]);

    useEffect(() => { getBoard() }, [])

    return (
        <div className="full-game">
            <div id="placeholder">
                {loading ? <div className='loading-message'>loading...</div> : <>
                <Board board={board!} autoPlace={autoPlace}></Board>
                
                </>}
                
            </div>
            {loading ? null : 
            <div className='generate-puzzles'>
                <div className="board-size-selector">
                    <label htmlFor="board-size-input">board size: </label>
                    <input type="number" id="board-size-input" name="size" min="4" max="10" value={boardSize} onChange={(e) => setBoardSize(parseInt(e.target.value))}/>
                </div>
                <br />
                <button
                onClick={getBoard}>
                generate new board
            </button>
            <br />
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

// what I want to do:
// have the landing page be a quick ruleset/demo
// the UI for generating puzzles should maybe be in a separate column
// actually label the size selector