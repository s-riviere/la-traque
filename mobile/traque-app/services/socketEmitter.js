// Services
import { socket } from "./socket";

export const emitLogin = (password, callback) => {
    if (!socket?.connected) return;
    console.log("Try to log in with :", password);
    socket.emit("login", password, callback);
};

export const emitLogout = () => {
    if (!socket?.connected) return;
    console.log("Logout.");
    socket.emit("logout");
};

export const emitSendPosition = () => {
    if (!socket?.connected) return;
    console.log("Reveal position.");
    socket.emit("send_position");
};

export const emitUpdatePosition = (location) => {
    if (!socket?.connected) return;
    console.log("Update position :", location);
    socket.emit("update_position", location);
};

export const emitCapture = (captureCode, callback) => {
    if (!socket?.connected) return;
    console.log("Try to capture :", captureCode);
    socket.emit("capture", captureCode, callback);
};

export const emitBattery = (level) => {
    if (!socket?.connected) return;
    console.log("Send battery level.");
    socket.emit('battery_update', level);
};

export const emitDeviceInfo = (infos) => {
    if (!socket?.connected) return;
    console.log("Send device infos.");
    socket.emit('device_info', infos);
};
