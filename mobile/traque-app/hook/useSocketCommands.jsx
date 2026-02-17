// React
import { useCallback } from 'react';
// Context
import { useSocket } from "../context/socketContext";

export const useSocketCommands = () => {
    const { teamSocket } = useSocket();

    const emitLogin = useCallback((password, callback) => {
        if (!teamSocket?.connected) return;
        console.log("Try to log in with :", password);
        teamSocket.emit("login", password, callback);
    }, [teamSocket]);

    const emitLogout = useCallback(() => {
        if (!teamSocket?.connected) return;
        console.log("Logout.");
        teamSocket.emit("logout");
    }, [teamSocket]);

    const emitSendPosition = useCallback(() => {
        if (!teamSocket?.connected) return;
        console.log("Reveal position.");
        teamSocket.emit("send_position");
    }, [teamSocket]);

    const emitUpdatePosition = useCallback((location) => {
        if (!teamSocket?.connected) return;
        console.log("Update position :", location);
        teamSocket.emit("update_position", location);
    }, [teamSocket]);

    const emitCapture = useCallback((captureCode, callback) => {
        if (!teamSocket?.connected) return;
        console.log("Try to capture :", captureCode);
        teamSocket.emit("capture", captureCode, callback);
    }, [teamSocket]);

    const emitBattery = useCallback((level) => {
        if (!teamSocket?.connected) return;
        console.log("Send battery level.");
        teamSocket.emit('battery_update', level);
    }, [teamSocket]);

    const emitDeviceInfo = useCallback((infos) => {
        if (!teamSocket?.connected) return;
        console.log("Send device infos.");
        teamSocket.emit('device_info', infos);
    }, [teamSocket]);

    return { emitLogin, emitLogout, emitSendPosition, emitUpdatePosition, emitCapture, emitBattery, emitDeviceInfo };
};
