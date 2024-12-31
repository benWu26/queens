import { Link } from "react-router-dom"
import Cell from "./Cell"
import Board from "./Board"
import sampleBoard from "./sampleBoard"

function Instructions() {
    return (
        <div className="instructions">
            <p>
                No two queens can be in the same row, column, of the same color, or touch diagonally.
            </p>
            <p>
                Click a cell once to place a dot, indicating that a queen cannot be placed there.
            </p>
            <p>
                Click again to place a queen.
            </p>
            <Link to="/play" className="play-link">play</Link>
        </div>
        
    )
}

export default Instructions