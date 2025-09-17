import { createContext, useContext, useMemo } from "react";
import { io } from "socket.io-client";

const HOST = 'traque.rezel.net'; // IP of the machine hosting the server

const SOCKET_URL = (HOST == "traque.rezel.net" ? "wss://" : "ws://") + HOST + "/player";
const SERVER_URL = (HOST == "traque.rezel.net" ? "https://" : "http://") + HOST + "/back";

export const teamSocket = io(SOCKET_URL, {
    path: "/back/socket.io",
});

export const SocketContext = createContext();

export default function SocketProvider({ children }) {
    const value = useMemo(() => ({ teamSocket, SERVER_URL }), [teamSocket]);
    return (
        <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}
