/*
This file manages team access to the server via websocket.
It receives messages, checks permissions, manages authentication and performs actions by calling functions from other modules.
This module also exposes functions to send messages via socket to all teams
*/
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
    game.teams.forEach(team => teamBroadcast(team.id, event, data));
}

/**
 * Send a socket message to all the players of a team
 * @param {String} teamId The team that will receive the message
 */
export function sendUpdatedTeamInformations(teamId) {
    // Test of parameters
    if (!game.hasTeam(teamId)) return false;
    // Variables
    const team = game.getTeam(teamId);
    const enemyTeam = game.getTeam(team.chasing);
    teamBroadcast(teamId, "update_team", {
        // Identification
        name: team.name,
        captureCode: team.captureCode,
        // Chasing
        captured: team.captured,
        enemyName: enemyTeam?.name,
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
        hasHandicap: team.hasHandicap,
        enemyHasHandicap: enemyTeam?.hasHandicap,
        // Stats
        distance: team.distance,
        nCaptures: team.nCaptures,
        nSentLocation: team.nSentLocation,
        stateDate: game.stateDate,
        finishDate: team.finishDate,
    });
}

export function initTeamSocket() {
    io.of("player").on("connection", (socket) => {
        console.log("Connection of a player");
        let teamId = null;

        const login = (loginTeamId) => {
            logout();
            if (!game.addPlayer(loginTeamId, socket.id)) return false;
            teamId = loginTeamId;
            return true;
        }

        const logout = () => {
            if (!teamId) return;
            game.removePlayer(teamId, socket.id);
            teamId = null;
        }

        socket.on("disconnect", () => {
            console.log("Disconnection of a player");
            logout();
        });

        socket.on("logout", () => {
            logout();
        });

        socket.on("login", (loginTeamId, callback) => {
            if (!login(loginTeamId)) {
                callback({ isLoggedIn: false, message: "Login denied" });
                return;
            }
            sendUpdatedTeamInformations(loginTeamId);
            socket.emit("game_state", {
                state: game.state,
                date: game.stateDate
            });
            socket.emit("current_zone", {
                begin: zoneManager.getCurrentZone(),
                end: zoneManager.getNextZone(),
                endDate: zoneManager.currentZone.endDate,
            });
            socket.emit("settings", game.getPlayerSettings());
            callback({ isLoggedIn : true, message: "Logged in"});
        });

        socket.on("update_position", (position) => {
            if (!teamId) return;
            if (game.isPlayerCapitain(teamId, socket.id)) {
                game.updateLocation(teamId, position);
            }
        });

        socket.on("send_position", () => {
            if (!teamId) return;
            game.sendLocation(teamId);
        });

        socket.on("capture", (captureCode, callback) => {
            if (!teamId) return;
            if (game.tryCapture(teamId, captureCode)) {
                callback({ hasCaptured : true, message: "Capture successful" });
            } else {
                callback({ hasCaptured : false, message: "Capture denied" });
            }
        });

        socket.on("device_info", (infos) => {
            if (!teamId) return;
            if (game.isPlayerCapitain(teamId, socket.id)) {
                game.updateTeam(teamId, {phoneModel: infos.model, phoneName: infos.name});
            }
        });

        socket.on("battery_update", (batteryLevel) => {
            if (!teamId) return;
            if (game.isPlayerCapitain(teamId, socket.id)) {
                game.updateTeam(teamId, {battery: batteryLevel});
            }
        });
    });
}
