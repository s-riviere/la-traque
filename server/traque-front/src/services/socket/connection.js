// Socket
import { env } from "next-runtime-env";
import { io } from "socket.io-client";

const NEXT_PUBLIC_SOCKET_HOST = env("NEXT_PUBLIC_SOCKET_HOST");
const SOCKET_URL = (NEXT_PUBLIC_SOCKET_HOST == "localhost" ? "ws://" : "wss://") + NEXT_PUBLIC_SOCKET_HOST;
const ADMIN_SOCKET_URL = SOCKET_URL + "/admin";

export const socket = io(ADMIN_SOCKET_URL, {
    path: "/back/socket.io",
});
