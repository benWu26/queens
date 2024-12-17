import { cellPropType } from './types';
import { memo } from 'react';
import dot from './assets/dot.svg';
import crown from './assets/crown.svg';

// what should be displayed in the cell
const symbols = {
    "valid": "",
    "invalid": <img className='symbol' src={dot} alt="" />,
    "star": <img className='symbol' src={crown} alt="" />
}

// for mapping colors to numbers (good for customization later!)
const colors = ["blue", "gray", "red", "yellow", "green", "purple", "orange", "pink"]

/**
 * React component for an individual cell
 * @param {cellPropType} props
 * @returns {JSX.Element}
 */
function Cell(props: cellPropType) {
    console.log("cell re-rendered!");

    return (
        <div className="cell" style={{ backgroundColor: colors[props.color] }} onClick={
            () => {
                props.updatePlayerStatus()
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

