import { useEffect } from "react";

export function useSocketListener(socket, event, callback) {
    useEffect(() => {
        socket.on(event,callback);
        return () => {
            socket.off(event, callback);
        }
    }, []);
}