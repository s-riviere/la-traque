import { useEffect, useState } from "react";

export function useTimeDifference(refTime, timeout) {
    // If refTime is in the past, time will be positive
    // If refTime is in the future, time will be negative
    // The time is updated every timeout milliseconds
    const [time, setTime] = useState(0);

    useEffect(() => {
        const updateTime = () => {
            setTime(Math.floor((Date.now() - refTime) / 1000));
        };

        updateTime();
        const interval = setInterval(updateTime, timeout);
    
        return () => clearInterval(interval);
    }, [refTime]);

    return [time];
}
