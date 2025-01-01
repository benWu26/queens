import {useState, useEffect, useRef} from 'react';
import { stopWatchPropTypes } from './types';

function Stopwatch (props: stopWatchPropTypes) {
    const [elapsedTime, setElapsedTime] = useState(0);

    const intervalIdRef = useRef(0);
    const startTimeRef = useRef(Date.now());

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

    useEffect(() => {
        if (props.reset) {
            startTimeRef.current = Date.now();
        }
    }, [props.reset])

    function formatTime() {
        const minutes = Math.floor(elapsedTime / (1000 * 60));
        const seconds = Math.floor(elapsedTime / 1000) % 60;
        const deciseconds = Math.floor(elapsedTime / 100) % 10

        return `${minutes ? minutes + ":" : ""}${minutes ? padZeros(seconds) : seconds}.${deciseconds}`;

    }

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