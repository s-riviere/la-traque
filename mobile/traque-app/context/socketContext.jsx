// React
import { createContext, useContext, useMemo } from "react";
// IO
import { io } from "socket.io-client";
// Util
import { SOCKET_URL } from "../util/constants";

const SocketContext = createContext();

const teamSocket = io(SOCKET_URL, {path: "/back/socket.io"});

export const SocketProvider = ({ children }) => {
    const value = useMemo(() => ({ teamSocket }), []);
    
    return (
        <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
    );
};

export const useSocket = () => {
    return useContext(SocketContext);
};
