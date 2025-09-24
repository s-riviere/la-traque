import { createContext, useContext, useMemo } from "react";
import { io } from "socket.io-client";
import { URLS } from "../util/urls"

const SOCKET_URL = `wss://${URLS.HOST}/player`;
const SERVER_URL = `https://${URLS.HOST}/back`;

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
