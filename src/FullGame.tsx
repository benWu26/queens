import {StrictMode, useState, useEffect, useCallback } from 'react'
import './index.css'
import Board from './Board.tsx'
import { boardType } from './types.ts'
import {generateValidBoardRuleBased} from './BoardGenerator.ts'

function FullGame() {
    const [board, setBoard] = useState<boardType | null>(null);
    const [loading, setLoading] = useState(true);
    const [boardSize, setBoardSize] = useState(8);
    const [autoPlace, setAutoPlace] = useState(true);

    const generateBoard = useCallback(() => { 
        setLoading(l => true); 
        setBoard(b => null);  

        setTimeout(() => {
            const newBoard = generateValidBoardRuleBased(boardSize); // Synchronous or async function
            setBoard(newBoard); // Update the board with the generated one
            setLoading(false); // Turn off loading
        }, 0);
    }, [boardSize]);

    useEffect(() => { generateBoard() }, [])

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
                    <input type="number" id="board-size-input" name="size" min="4" max="12" value={boardSize} onChange={(e) => setBoardSize(s => parseInt(e.target.value))}/>
                </div>
                <br />
                <button
                onClick={generateBoard}>
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