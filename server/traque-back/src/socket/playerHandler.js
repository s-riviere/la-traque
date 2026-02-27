import { gameManager } from "@/core/game_manager.js";

export const EVENTS = {
    INTERNAL: {
        LOGOUT: "logout",
        TEAM_UPDATE: "team-update",
    },
    IN: {
        LOGIN: "login",
        LOGOUT: "logout",
        LOCATION: "location",
        SCAN: "scan",
        CAPTURE: "capture",
        DEVICE: "device",
    },
    OUT: {
        LOGOUT: "logout",
        TEAM_UPDATE: "team-update",
    },
};

export function initPlayerSocketHandler(io) {

    // Util

    const emit = (targetId, event, data) => {
        io.of("player").to(targetId).emit(event, data);
    };


    // Game manager events

    gameManager.on(EVENTS.INTERNAL.LOGOUT, (targetId) => {
        emit(targetId, EVENTS.OUT.LOGOUT);
    });

    gameManager.on(EVENTS.INTERNAL.TEAM_UPDATE, (targetId, playTeamData) => {
        emit(targetId, EVENTS.OUT.TEAM_UPDATE, playTeamData);
    });


    // Player events

    io.of("player").on("connect", (socket) => {
        console.log("Connection of a player");

        // Variables

        let teamId = null;


        // Util

        const isLoggedIn = () => {
            return teamId !== null;
        }

        const logout = () => {
            if (!isLoggedIn()) return;
            socket.leave(teamId);
            teamId = null;
        }

        const login = (loginTeamId) => {
            if (!gameManager.teams.has(loginTeamId) || teamId === loginTeamId) return;
            logout();
            teamId = loginTeamId
            socket.join(teamId);
        }


        // Socket

        socket.on("disconnect", () => {
            console.log("Disconnection of a player");
            logout();
        });


        // Authentication

        socket.on(EVENTS.IN.LOGIN, (loginTeamId, callback) => {
            login(loginTeamId);
            callback(isLoggedIn());
            if (isLoggedIn()) gameManager.emitTeamUpdate(socket.id, gameManager.teams.get(teamId));
        });

        socket.on(EVENTS.IN.LOGOUT, () => {
            logout();
        });


        // Actions

        socket.on(EVENTS.IN.LOCATION, (coords) => {
            if (!isLoggedIn()) return;
            gameManager.updateLocation(teamId, coords);
        });

        socket.on(EVENTS.IN.SCAN, (coords) => {
            if (!isLoggedIn()) return;
            gameManager.scan(teamId, coords);
        });

        socket.on(EVENTS.IN.CAPTURE, (captureCode, callback) => {
            if (!isLoggedIn()) return;
            const success = gameManager.capture(teamId, captureCode);
            callback(success);
        });
    });
}
