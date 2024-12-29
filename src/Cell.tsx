import { cellPropType } from './types';
import React, { memo, useState } from 'react';
import dot from './assets/dot.svg';
import crown from './assets/crown.svg';
import error from './assets/error.svg';

// what should be displayed in the cell
const symbols = {
    "valid": "",
    "invalid": <img className='symbol' src={dot} alt="" />,
    "star": <img className='symbol' src={crown} alt="" />,

    //added cross
    "error": <img className='symbol' src={error} alt="" />
}

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
]

/**
 * React component for an individual cell
 * @param {cellPropType} props
 * @returns {JSX.Element}
 */
function Cell(props: cellPropType) {
    console.log("cell re-rendered!");
    const style: React.CSSProperties = { backgroundColor: colors[props.color]};

    style.borderLeft = props.leftBorder ? "3px solid black" : "1px solid black"
    style.borderRight = props.rightBorder ? "3px solid black" : "1px solid black"
    style.borderBottom = props.bottomBorder ? "3px solid black" : "1px solid black"
    style.borderTop = props.topBorder ? "3px solid black" : "1px solid black"

    return (
        <div className="cell" style={style} 
        onMouseDown={
            () => {
                props.updatePlayerStatusClick();
            }
        }
        onMouseEnter={
            () => {
                props.updatePlayerStatusDrag();
            }
        }>
            {/* What to display in the cell depending on the playerStatus */}
            {symbols[props.playerStatus]}
        
        </div>
    )
}

export default memo(Cell, (prevProps, nextProps) => {
    return (
        prevProps.playerStatus === nextProps.playerStatus
    );
});

