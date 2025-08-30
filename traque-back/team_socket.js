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
    for (const socketId of game.getTeam(teamId).sockets) {
        io.of("player").to(socketId).emit(event, data);
    }
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
        penalties: team.penalties,
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

/**
 * Remove a player from the list of logged in players
 * @param {Number} id The id of the player to log out
 */
function logoutPlayer(id) {
    for (const team of game.teams) {
        if (team.sockets.indexOf(id) == 0) {
            team.battery = null;
            team.phoneModel = null;
            team.phoneName = null;
        }
        team.sockets = team.sockets.filter((sid) => sid != id);
    }
    secureAdminBroadcast("teams", game.teams);
}

export function initTeamSocket() {
    io.of("player").on("connection", (socket) => {
        console.log("Connection of a player");
        let teamId = null;

        socket.on("disconnect", () => {
            console.log("Disconnection of a player");
            logoutPlayer(socket.id);
        });

        socket.on("login", (loginTeamId, callback) => {
            const team = game.getTeam(loginTeamId);
            if (!team) {
                callback({ isLoggedIn: false, message: "Login denied" });
                return;
            }
            logoutPlayer(socket.id);
            team.sockets.push(socket.id);
            teamId = loginTeamId;
            sendUpdatedTeamInformations(loginTeamId);
            socket.emit("login_response", true);
            socket.emit("game_state", game.state);
            socket.emit("game_settings", game.settings);
            socket.emit("zone", {
                begin: zoneManager.getCurrentZone(),
                end: zoneManager.getNextZone(),
                endDate: zoneManager.currentZoneEndDate,
            })
            callback({ isLoggedIn : true, message: "Logged in"});
        });

        socket.on("logout", () => {
            logoutPlayer(socket.id);
            teamId = null;
        })

        socket.on("update_position", (position) => {
            // Only the first player to connect to the team socket can update the current position
            // This is done to prevent multiple clients from sending slightly different prosition back and forth
            // Making the point jitter on the map
            if (!teamId) {
                return;
            }
            const team = game.getTeam(teamId);
            if (team.sockets.indexOf(socket.id) == 0) {
                game.updateLocation(teamId, position);
                team.lastCurrentLocationDate = Date.now();
            }
            secureAdminBroadcast("teams", game.teams);
        });

        socket.on("send_position", () => {
            if (!teamId) {
                return;
            }
            game.sendLocation(teamId);
        });

        socket.on("capture", (captureCode, callback) => {
            if (!teamId) {
                return;
            }
            if (!game.requestCapture(teamId, captureCode)) {
                callback({ hasCaptured : false, message: "Capture failed" });
                return;
            }
            callback({ hasCaptured : true, message: "Capture successful" });
        });

        socket.on("deviceInfo", (infos) => {
            if (!teamId) {
                return;
            }
            const team = game.getTeam(teamId);
            // Only the first socket shares its infos since he is the one whose location is tracked
            if (team.sockets.indexOf(socket.id) == 0) {
                team.phoneModel = infos.model;
                team.phoneName = infos.name;
            }
        });

        socket.on("batteryUpdate", (batteryLevel) => {
            if (!teamId) {
                return;
            }
            const team = game.getTeam(teamId);
            // Only the first socket shares its infos since he is the one whose location is tracked
            if (team.sockets.indexOf(socket.id) == 0) {
                team.battery = batteryLevel;
            }
        });
    });
}