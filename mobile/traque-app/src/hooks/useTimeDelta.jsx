// React
import { useState, useEffect } from 'react';

export const useCountdownSeconds = (date) => {
    const getSecondsTo = (newDate) => !newDate ? 0 : Math.max(0, Math.floor((newDate - Date.now()) / 1000));
    const [time, setTime] = useState(() => getSecondsTo(date));
    const [prevDate, setPrevDate] = useState(date);

    if (date !== prevDate) {
        setPrevDate(date);
        setTime(getSecondsTo(date));
    }

    useEffect(() => {
        const interval = setInterval(() => {
            const seconds = getSecondsTo(date);
            setTime(seconds);
            if (seconds === 0) clearInterval(interval);
        }, 1000);

        return () => clearInterval(interval);
    }, [date]);

    return time;
};

export const useTimeSinceSeconds = (date) => {
    const getSecondsTo = (newDate) => !newDate ? 0 : Math.max(0, Math.floor((Date.now() - newDate) / 1000));
    const [time, setTime] = useState(() => getSecondsTo(date));
    const [prevDate, setPrevDate] = useState(date);

    if (date !== prevDate) {
        setPrevDate(date);
        setTime(getSecondsTo(date));
    }

    useEffect(() => {
        const interval = setInterval(() => setTime(getSecondsTo(date)), 1000);

        return () => clearInterval(interval);
    }, [date]);

    return time;
};
