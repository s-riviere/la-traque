// Socket
import { io } from "socket.io-client";
// Constants
import { SOCKET_URL } from "@/config";

export const socket = io(SOCKET_URL, {
    path: "/back/socket.io"
});
