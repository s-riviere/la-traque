// React
import { useState, useEffect } from 'react';

export const useCountdownSeconds = (date) => {
    const [time, setTime] = useState(0);

    useEffect(() => {
        if (!date) {
            setTime(0);
            return;
        }

        let interval;

        const updateTime = () => {
            const timeLeft = Math.floor((date - Date.now()) / 1000);
            
            if (timeLeft <= 0) {
                setTime(0);
                clearInterval(interval);
            } else {
                setTime(timeLeft);
            }
        };

        updateTime();
        interval = setInterval(updateTime, 1000);
    
        return () => clearInterval(interval);
    }, [date]);

    return time;
};

export const useTimeSinceSeconds = (date) => {
    const [time, setTime] = useState(0);

    useEffect(() => {
        if (!date) {
            setTime(0);
            return;
        }

        const updateTime = () => {
            const timeSince = Math.floor((Date.now() - date) / 1000);
            
            if (timeSince <= 0) {
                setTime(0);
            } else {
                setTime(timeSince);
            }
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
    
        return () => clearInterval(interval);
    }, [date]);

    return time;
};
