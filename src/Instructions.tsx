import { Link } from "react-router-dom"
import invertedCrown from "./assets/inverted-crown.svg"

function Instructions() {
    return (
        <div className="instructions">
            <img src={invertedCrown} alt="" className="logo" />
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