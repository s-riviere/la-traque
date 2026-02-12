import { createContext, useContext, useMemo } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = `ws://172.16.1.180/player`;
const SERVER_URL = `http://172.16.1.180/back`;

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
