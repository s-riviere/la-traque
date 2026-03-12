// Services
import { socket } from "@/services/socket/connection";

const customEmit = (event, ...args) => {
    if (!socket?.connected) return false;
    console.log("Emit", event);
    socket.emit(event, ...args);
    return true;
};

const customEmitCallback = (event, ...args) => {
    return new Promise((resolve, reject) => {
        if (!socket?.connected) return reject(new Error("Socket not connected"));

        console.log("Emit", event);

        const timeout = setTimeout(() => {
            console.warn("Server timeout");
            reject(new Error("Timeout"));
        }, 3000);
    
        socket.emit(event, ...args, (response) => {
            clearTimeout(timeout);
            console.log("Received : ", response);
            resolve(response);
        });
    });
};

export const emitLogin = (password) => {
    return customEmitCallback("login", password);
};

export const emitLogout = () => {
    return customEmit("logout");
};

export const emitSendPosition = (location) => {
    return customEmit("send_position", location);
};

export const emitUpdatePosition = (location) => {
    return customEmit("update_position", location);
};

export const emitCapture = (captureCode) => {
    return customEmitCallback("capture", captureCode);
};

export const emitBattery = (level) => {
    return customEmit("battery_update", level);
};

export const emitDeviceInfo = (infos) => {
    return customEmit("device_info", infos);
};
