// React
import { useEffect } from "react";

export const useSocketListener = (socket, event, callback) => {
    useEffect(() => {
        socket.on(event, callback);
        return () => {
            socket.off(event, callback);
        };
    }, [callback, event, socket]);
};
