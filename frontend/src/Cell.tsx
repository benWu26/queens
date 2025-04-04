import { cellPropType } from "shared";
import React, { memo } from "react";
import Dot from "./assets/dot.svg?react";
import Crown from "./assets/crown.svg?react";
import Error from "./assets/error.svg?react";

// what should be displayed in the cell
const symbols = {
    valid: "",
    invalid: <Dot className="symbol" />,
    star: <Crown className="symbol" />,
    error: <Error className="symbol" />,
};

// for mapping colors to numbers (good for customization later!)

const colors = [
    "#e63e3e", // lightred
    "#ffa800", // lightorange
    "#ffe600", // lightyellow
    "#8ce600", // lightgreen
    "#00e6aa", // lightcyan
    "#008ce6", // lightblue
    "#aa00e6", // lightpurple
    "#e600aa", // lightmagenta
    "#e6e6e6", // lightgray
    "#ff99cc", // lightpink
    "#ff7f50", // lightcoral
    "#00bfe6", // lightteal
];

/**
 * React component for an individual cell
 * @param {cellPropType} props
 * @returns {JSX.Element}
 */
function Cell(props: cellPropType) {
    console.log("cell re-rendered!");
    const style: React.CSSProperties = { backgroundColor: colors[props.color] };

    style.borderLeft = props.leftBorder ? "3px solid black" : "1px solid black";
    style.borderRight = props.rightBorder ? "3px solid black" : "1px solid black";
    style.borderBottom = props.bottomBorder ? "3px solid black" : "1px solid black";
    style.borderTop = props.topBorder ? "3px solid black" : "1px solid black";

    return (
        <div
            className="cell"
            style={style}
            onMouseDown={() => {
                props.updatePlayerStatusClick();
            }}
            onMouseEnter={() => {
                props.updatePlayerStatusDrag();
            }}
        >
            {/* What to display in the cell depending on the playerStatus */}
            {symbols[props.playerStatus]}
        </div>
    );
}

export default memo(Cell, (prevProps, nextProps) => {
    return (
        prevProps.playerStatus === nextProps.playerStatus &&
        prevProps.color === nextProps.color &&
        prevProps.leftBorder === nextProps.leftBorder &&
        prevProps.rightBorder === nextProps.rightBorder &&
        prevProps.bottomBorder === nextProps.bottomBorder &&
        prevProps.topBorder === nextProps.topBorder
    );
});
