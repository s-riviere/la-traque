import { createContext, useContext, useMemo } from "react";
import { io } from "socket.io-client";

const IP = "172.16.1.180";
const SOCKET_URL = `ws://${IP}/player`;
const SERVER_URL = `http://${IP}/back`;

export const teamSocket = io(SOCKET_URL, {
    path: "/back/socket.io",
});

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const value = useMemo(() => ({ teamSocket, SERVER_URL }), []);
    
    return (
        <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
    );
};

export const useSocket = () => {
    return useContext(SocketContext);
};
