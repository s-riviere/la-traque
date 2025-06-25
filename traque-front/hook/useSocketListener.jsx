"use client";
import { useEffect } from "react";

export default function useSocketListener(socket, event, callback) {
    useEffect(() => {
        socket.on(event,callback);
        return () => {
            socket.off(event, callback);
        }
    }, []);
}
