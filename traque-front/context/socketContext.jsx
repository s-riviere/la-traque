"use client";
import { createContext, useContext, useMemo } from "react";

const { io } = require("socket.io-client");

var proto = "wss://";
if (process.env.NEXT_PUBLIC_SOCKET_HOST == "localhost") {
    proto = "ws://";
}
const SOCKET_URL = proto + process.env.NEXT_PUBLIC_SOCKET_HOST;
const USER_SOCKET_URL = SOCKET_URL + "/player";
const ADMIN_SOCKET_URL = SOCKET_URL + "/admin";

export const teamSocket = io(USER_SOCKET_URL, {
    path: "/back/socket.io",
});
export const adminSocket = io(ADMIN_SOCKET_URL, {
    path: "/back/socket.io",
});

export const SocketContext = createContext();

export default function SocketProvider({ children }) {
    const value = useMemo(() => ({ teamSocket, adminSocket }), [teamSocket, adminSocket]);
    return (
        <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}
