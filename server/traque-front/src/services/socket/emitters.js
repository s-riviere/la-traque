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


// Authentication

export const emitLogin = (password) => {
    return customEmitCallback("login", password);
};

export const emitLogout = () => {
    return customEmit("logout");
};


// Game

export const emitState = (state) => {
    return customEmit("state", state);
};

export const emitSettings = (settings) => {
    return customEmit("settings", settings);
};


// Teams

export const emitAddTeam = (teamName) => {
    return customEmit("add-team", teamName);
};

export const emitRemoveTeam = (teamId) => {
    return customEmit("remove-team", teamId);
};

export const emitReorderTeam = (newTeamsOrder) => {
    return customEmit("reorder-team", newTeamsOrder);
};

export const emitEliminateTeam = (teamId) => {
    return customEmit("eliminate-team", teamId);
};

export const emitReviveTeam = (teamId) => {
    return customEmit("revive-team", teamId);
};
