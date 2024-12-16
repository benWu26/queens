import { playerStatusType, realStatusType, cellPropType } from "./types"

const symbols = {
    "valid": "",
    "invalid": "x",
    "star": "*"
}

const colors = ["blue", "gray", "red", "yellow", "green", "purple", "orange", "pink"]



function Cell(props: cellPropType) {


    return (
        <div className="cell" style={{ backgroundColor: colors[props.cell.color] }}>

        </div>
    )
}

export default Cell;

