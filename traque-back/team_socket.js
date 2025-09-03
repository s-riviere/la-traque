/*
This file manages team access to the server via websocket.
It receives messages, checks permissions, manages authentication and performs actions by calling functions from other modules.
This module also exposes functions to send messages via socket to all teams
*/
import { secureAdminBroadcast } from "./admin_socket.js";
import { io } from "./index.js";
import game from "./game.js";
import zoneManager from "./zone_manager.js";

/**
 * Send a socket message to all the players of a team
 * @param {String} teamId The team that will receive the message
 * @param {String} event Event name
 * @param {*} data The payload
 */
export function teamBroadcast(teamId, event, data) {
    game.getTeam(teamId).sockets.forEach(socketId => io.of("player").to(socketId).emit(event, data));
}

/**
 * Send a message to all logged in players 
 * @param {String} event Event name
 * @param {String} data payload
 */
export function playersBroadcast(event, data) {
    for (const team of game.teams) {
        teamBroadcast(team.id, event, data);
    }
}

/**
 * Send a socket message to all the players of a team
 * @param {String} teamId The team that will receive the message
 */
export function sendUpdatedTeamInformations(teamId) {
    const team = game.getTeam(teamId);
    if (!team) return;
    teamBroadcast(teamId, "update_team", {
        // Identification
        name: team.name,
        captureCode: team.captureCode,
        // Chasing
        captured: team.captured,
        enemyName: game.getTeam(team.chasing)? game.getTeam(team.chasing).name : null,
        // Locations
        lastSentLocation: team.lastSentLocation,
        enemyLocation: team.enemyLocation,
        // Placement phase
        startingArea: team.startingArea,
        ready: team.ready,
        // Constraints
        outOfZone: team.outOfZone,
        outOfZoneDeadline: team.outOfZoneDeadline,
        locationSendDeadline: team.locationSendDeadline,
        // Stats
        distance: team.distance,
        nCaptures: team.nCaptures,
        nSentLocation: team.nSentLocation,
        startDate: game.startDate,
        finishDate: team.finishDate,
    })
    secureAdminBroadcast("teams", game.teams);
}

export function initTeamSocket() {
    io.of("player").on("connection", (socket) => {
        console.log("Connection of a player");
        let teamId = null;

        const logoutPlayer = () => {
            if (!teamId) return;
            const team = game.getTeam(teamId);
            if (team.sockets.indexOf(socket.id) == 0) {
                team.battery = null;
                team.phoneModel = null;
                team.phoneName = null;
            }
            // Delete the player from the team
            team.sockets = team.sockets.filter((sid) => sid != socket.id);
            secureAdminBroadcast("teams", game.teams);
            socket.emit("logout");
            teamId = null;
        }

        socket.on("disconnect", () => {
            console.log("Disconnection of a player");
            logoutPlayer();
        });

        socket.on("logout", () => {
            logoutPlayer();
        });

        socket.on("login", (loginTeamId, callback) => {
            logoutPlayer();
            const team = game.getTeam(loginTeamId);
            if (!team) {
                callback({ isLoggedIn: false, message: "Login denied" });
                return;
            }
            teamId = loginTeamId;
            team.sockets.push(socket.id);
            sendUpdatedTeamInformations(loginTeamId);
            socket.emit("game_state", game.state);
            socket.emit("game_settings", game.settings);
            socket.emit("zone", {
                type: zoneManager.settings.type,
                begin: zoneManager.getCurrentZone(),
                end: zoneManager.getNextZone(),
                endDate: zoneManager.currentZoneEndDate,
            });
            callback({ isLoggedIn : true, message: "Logged in"});
        });

        socket.on("update_position", (position) => {
            if (!teamId) return;
            const team = game.getTeam(teamId);
            // Only the first socket can update the current position since he is the one whose location is tracked
            if (team.sockets.indexOf(socket.id) == 0) {
                game.updateLocation(teamId, position);
                team.lastCurrentLocationDate = Date.now();
            }
            secureAdminBroadcast("teams", game.teams);
        });

        socket.on("send_position", () => {
            if (!teamId) return;
            game.sendLocation(teamId);
        });

        socket.on("capture", (captureCode, callback) => {
            if (!teamId) return;
            game.requestCapture(teamId, captureCode);
            callback({ hasCaptured : true, message: "Capture successful" });
        });

        socket.on("device_info", (infos) => {
            if (!teamId) return;
            const team = game.getTeam(teamId);
            // Only the first socket shares its infos since he is the one whose location is tracked
            if (team.sockets.indexOf(socket.id) == 0) {
                team.phoneModel = infos.model;
                team.phoneName = infos.name;
            }
        });

        socket.on("battery_update", (batteryLevel) => {
            if (!teamId) return;
            const team = game.getTeam(teamId);
            // Only the first socket shares its infos since he is the one whose location is tracked
            if (team.sockets.indexOf(socket.id) == 0) {
                team.battery = batteryLevel;
            }
        });
    });
}