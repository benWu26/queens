import { cellPropType } from './types';
import React, { memo, useState } from 'react';
import dot from './assets/dot.svg';
import crown from './assets/crown.svg';

// what should be displayed in the cell
const symbols = {
    "valid": "",
    "invalid": <img className='symbol' src={dot} alt="" />,
    "star": <img className='symbol' src={crown} alt="" />
}

// for mapping colors to numbers (good for customization later!)
const colors = ["skyblue", "gray", "red", "yellow", "green", "purple", "orange", "pink", "brown", "blue", "cyan", "magenta"]

/**
 * React component for an individual cell
 * @param {cellPropType} props
 * @returns {JSX.Element}
 */
function Cell(props: cellPropType) {
    // console.log("cell re-rendered!");
    const style: React.CSSProperties = { backgroundColor: colors[props.color]};

    style.borderLeft = props.leftBorder ? "2px solid black" : "1px solid black"
    style.borderRight = props.rightBorder ? "2px solid black" : "1px solid black"
    style.borderBottom = props.bottomBorder ? "2px solid black" : "1px solid black"
    style.borderTop = props.topBorder ? "2px solid black" : "1px solid black"

    return (
        <div className="cell" style={style} 
        onMouseDown={
            () => {
                props.updatePlayerStatusClick();
            }
        }
        onMouseOver={
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

