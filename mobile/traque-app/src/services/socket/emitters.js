// Services
import { socket } from "@/services/socket/connection";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const connectSocketAsync = () => {
    return new Promise(async (resolve) => {
        if (socket.connected) return resolve(true);

        socket.connect();

        const connected = await new Promise((res) => {
            socket.once("connect", () => res(true));
            socket.once("connect_error", () => res(false));
            setTimeout(() => res(false), 5000);
        });
        if (!connected) return resolve(false);

        try {
            const rawItem = await AsyncStorage.getItem("team_id");
            if (rawItem) {
                const teamId = JSON.parse(rawItem);
                console.log("Emit login");
                socket.emit("login", teamId, (response) => {
                    console.log("Received : ", response);
                    resolve(response && response.isLoggedIn);
                });
                setTimeout(() => resolve(false), 3000);
            } else {
                console.log("No team_id found for auto-login");
                resolve(true);
            }
        } catch (e) {
            console.error("Auto-login error:", e);
            resolve(false);
        }
    });
};

const customEmit = async (event, ...args) => {
    const isConnected = await connectSocketAsync();
    if (!isConnected) {
        console.error(`Failed to connect for event: ${event}`);
        return false;
    }
    console.log("Emit", event);
    socket.emit(event, ...args);
    return true;
};

const customEmitCallback = async (event, ...args) => {
    const isConnected = await connectSocketAsync();
    if (!isConnected) {
        throw new Error("Socket connection failed");
    }

    return new Promise((resolve, reject) => {
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
