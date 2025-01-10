import {useState, useEffect, useRef} from 'react';
import { stopWatchPropTypes } from 'shared';

function Stopwatch (props: stopWatchPropTypes) {
    const [elapsedTime, setElapsedTime] = useState(0);

    // the ID of the current interval used to update the time
    const intervalIdRef = useRef(0);

    // when the stopwatch started
    const startTimeRef = useRef(Date.now());

    // updates the time every 100ms
    useEffect(() => {
        if (props.isRunning) {
            intervalIdRef.current = setInterval(() => {
                setElapsedTime(Date.now() - startTimeRef.current);
            }, 100);
        }

        return () => {
            clearInterval(intervalIdRef.current);
        }
        
    }, [props.isRunning])

    // resets time to 0
    useEffect(() => {
        if (props.reset) {
            startTimeRef.current = Date.now();
        }
    }, [props.reset])

    // formats the elapsed time correctly
    function formatTime() {
        const minutes = Math.floor(elapsedTime / (1000 * 60));
        const seconds = Math.floor(elapsedTime / 1000) % 60;
        const deciseconds = Math.floor(elapsedTime / 100) % 10

        return `${minutes ? minutes + ":" : ""}${minutes ? padZeros(seconds) : seconds}.${deciseconds}`;

    }

    // pads a number with a zero if it's less than 10
    const padZeros = (n: number) => {
        return (n < 10 ? "0" + n : n)
    }

    return (
        <div className="stopwatch">
            <div className="display">{"solve time: " + formatTime()}</div>
        </div>
    )
}


export default Stopwatch;