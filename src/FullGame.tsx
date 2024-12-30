import {StrictMode, useState, useEffect, useCallback } from 'react'
import './index.css'
import Board from './Board.tsx'
import { boardType } from './types.ts'
import {generateValidBoardRuleBased} from './BoardGenerator.ts'

function FullGame() {
    const [board, setBoard] = useState<boardType | null>(null);
    const [loading, setLoading] = useState(true);
    const [boardSize, setBoardSize] = useState(8);

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
                {loading ? <div className='loading-message'>loading...</div> : <Board board={board!}></Board>}
            </div>
            {loading ? null : 
            <>
                <input type="number" id="board-size-input" name="size" min="8" max="12" value={boardSize} onChange={(e) => setBoardSize(s => parseInt(e.target.value))}/>
                <button
                onClick={generateBoard}>
                Regenerate
            </button>
            </>
            
            }
            
            
        </div>
    )
}

export default FullGame