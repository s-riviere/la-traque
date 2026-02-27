import { createHash } from "crypto";
import { gameManager } from "@/core/game_manager.js"
import { ADMIN_PASSWORD_HASH } from "@/util/util.js";

export const EVENTS = {
    INTERNAL: {
        TEAMS_UPDATE: "teams-update",
        SETTINGS: "settings",
    },
    IN: {
        LOGIN: "login",
        LOGOUT: "logout",
        STATE: "state",
        SETTINGS: "settings",
        ADD_TEAM: "add-team",
        REMOVE_TEAM: "remove-team",
        REORDER_TEAM: "reorder-team",
        ELIMINATE_TEAM: "eliminate-team",
        REVIVE_TEAM: "revive-team",
    },
    OUT: {
        TEAMS_UPDATE: "teams-update", // TODO : Too big ? (Send only the changing teams ?)
        SETTINGS: "settings",
    },
};

const ADMIN_ROOM = "admin_room";

export function initAdminSocketHandler(io) {

    // Util

    const emit = (targetId, event, data) => {
        io.of("admin").to(targetId).emit(event, data);
    };

    const broadcast = (event, data) => {
        io.of("admin").to(ADMIN_ROOM).emit(event, data);
    };


    // Admin events

    io.of("admin").on("connection", (socket) => {
        console.log("Connection of an admin");

        // Variables

        let loggedIn = false;


        // Util

        const logout = () => {
            if (!loggedIn) return;
            loggedIn = false;
            socket.leave(ADMIN_ROOM);
        }

        const login = (password) => {
            if (loggedIn) return;
            if (createHash('sha256').update(password).digest('hex') !== ADMIN_PASSWORD_HASH) return false;
            loggedIn = true;
            socket.join(ADMIN_ROOM);
        }


        // Socket

        socket.on("disconnect", () => {
            console.log("Disconnection of an admin");
            logout();
        });


        // Authentication

        socket.on(EVENTS.IN.LOGIN, (password) => {
            login(password);
        });

        socket.on(EVENTS.IN.LOGOUT, () => {
            logout();
        });

        
        // Actions

        socket.on(EVENTS.IN.ADD_TEAM, (teamId) => {
            if (!loggedIn) return;
            gameManager.addTeam(teamId);
        });

        socket.on(EVENTS.IN.REMOVE_TEAM, (teamId) => {
            if (!loggedIn) return;
            gameManager.removeTeam(teamId);
        });

        socket.on(EVENTS.IN.REORDER_TEAM, (teamId) => {
            if (!loggedIn) return;
            gameManager.reorderTeam(teamId);
        });

        socket.on(EVENTS.IN.ELIMINATE_TEAM, (teamId) => {
            if (!loggedIn) return;
            gameManager.eliminate(teamId);
        });

        socket.on(EVENTS.IN.REVIVE_TEAM, (teamId) => {
            if (!loggedIn) return;
            gameManager.revive(teamId);
        });

        socket.on(EVENTS.IN.STATE, (state) => {
            if (!loggedIn) return;
            gameManager.setState(state);
        });

        socket.on(EVENTS.IN.SETTINGS, (settings) => {
            if (!loggedIn) return;
            gameManager.setSettings(settings);
        });
    });
}
