import { secureAdminBroadcast } from "./admin_socket.js";
import { io} from "./index.js";
import game from "./game.js";
import zone from "./zone_manager.js";

/**
 * Send a socket message to all the players of a team
 * @param {String} teamId The team that will receive the message
 * @param {String} event Event name
 * @param {*} data The payload
 */
export function teamBroadcast(teamId, event, data) {
    for (let socketId of game.getTeam(teamId).sockets) {
        io.of("player").to(socketId).emit(event, data)
    }
}

/**
 * Send a message to all logged in players 
 * @param {String} event Event name
 * @param {String} data payload
 */
export function playersBroadcast(event, data) {
    for (let team of game.teams) {
        teamBroadcast(team.id, event, data);
    }
}

/**
 * Remove a player from the list of logged in players
 * @param {Number} id The id of the player to log out
 */
function logoutPlayer(id) {
    for (let team of game.teams) {
        team.sockets = team.sockets.filter((sid) => sid != id);
    }
}

export function sendUpdatedTeamInformations(teamId) {
    let team = game.getTeam(teamId)
    if(!team) {
        return false;
    }
    team.sockets.forEach(socketId => {
        io.of("player").to(socketId).emit("update_team", {
            name: team.name,
            enemyLocation: team.enemyLocation,
            enemyName: team.enemyName,
            currentLocation: team.currentLocation,
            lastSentLocation: team.lastSentLocation,
            locationSendDeadline: team.locationSendDeadline,
            captureCode: team.captureCode,
            startingArea: team.startingArea,
            ready: team.ready,
            captured: team.captured,
            penalties: team.penalties,
        })
    })
}
export function initTeamSocket() {

    io.of("player").on("connection", (socket) => {
        let teamId = null;
        console.log("a user connected");

        socket.on("disconnect", () => {
            console.log("user disconnected");
            logoutPlayer(socket.id)
        });

        socket.on("login", (loginTeamId) => {
            if (game.getTeam(loginTeamId) === undefined) {
                socket.emit("login_response", false);
                return;
            }
            logoutPlayer(socket.id)
            teamId = loginTeamId;
            let team = game.getTeam(loginTeamId);
            team.sockets.push(socket.id);
            sendUpdatedTeamInformations(loginTeamId);
            socket.emit("login_response", true);
            socket.emit("game_state", game.state)
            socket.emit("game_settings", game.settings)
            socket.emit("zone", zone.currentZone)
            socket.emit("new_zone", {
                begin: zone.currentStartZone,
                end: zone.nextZone
            })
        });

        socket.on("logout", () => {
            logoutPlayer(socket.id);
        })

        socket.on("update_position", (position) => {
            // Only the first player to connect to the team socket can update the current position
            // This is done to prevent multiple clients from sending slightly different prosition back and forth
            // Making the point jitter on the map
            if (!teamId) {
                socket.emit("error", "not logged in yet");
                return;
            }
            let team = game.getTeam(teamId)
            if(team == undefined) {
                logoutPlayer(socket.id);
                return;
            }
            if (team.sockets.indexOf(socket.id) == 0) {
                game.updateLocation(teamId, position);
                teamBroadcast(teamId, "update_team", { currentLocation: team.currentLocation, ready: team.ready });
                secureAdminBroadcast("teams", game.teams);
            }
        });

        socket.on("send_position", () => {
            game.sendLocation(teamId);
            let team = game.getTeam(teamId);
            if (team === undefined) {
                socket.emit("error", "Team not found");
                return;
            }
            game.updateTeamChasing();
            teamBroadcast(teamId, "update_team", { enemyLocation: team.enemyLocation,locationSendDeadline: team.locationSendDeadline  });
            teamBroadcast(teamId,"success", "Position udpated")
            secureAdminBroadcast("teams", game.teams)
        });

        socket.on('capture', (captureCode) => {
            let capturedTeam = game.getTeam(teamId)?.chasing
            if (capturedTeam !== undefined && game.requestCapture(teamId, captureCode)) {
                sendUpdatedTeamInformations(teamId)
                sendUpdatedTeamInformations(capturedTeam)
                secureAdminBroadcast("teams", game.teams);
            } else {
                socket.emit("error", "Incorrect code")
            }
        })
    });
}