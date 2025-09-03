/*
This module manages the admin access to the server via websocket.
It receives messages, checks permissions, manages authentication and performs actions by calling functions from other modules.
This module also exposes functions to send messages via socket to all admins
*/
import { io } from "./index.js";
import game from "./game.js"
import zoneManager from "./zone_manager.js"
import { playersBroadcast, sendUpdatedTeamInformations } from "./team_socket.js";
import { createHash } from "crypto";
import { config } from "dotenv";

config();

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

/**
 * Send a message to all logged in admin sockets
 * @param {String} event The event name
 * @param {String} data The data to send
 */
export function secureAdminBroadcast(event, data) {
    loggedInSockets.forEach(s => {
        io.of("admin").to(s).emit(event, data);
    });
}

// Array of logged in sockets
let loggedInSockets = [];

export function initAdminSocketHandler() {
    io.of("admin").on("connection", (socket) => {
        console.log("Connection of an admin");
        let loggedIn = false;

        socket.on("disconnect", () => {
            console.log("Disconnection of an admin");
            loggedInSockets = loggedInSockets.filter(s => s !== socket.id);
            loggedIn = false;
        });

        socket.on("logout", () => {
            loggedInSockets = loggedInSockets.filter(s => s !== socket.id);
            loggedIn = false;
        })

        socket.on("login", (password) => {
            const hash = createHash('sha256').update(password).digest('hex');
            if (hash === ADMIN_PASSWORD_HASH && !loggedIn) {
                loggedInSockets.push(socket.id);
                loggedIn = true;
                socket.emit("teams", game.teams);
                socket.emit("game_state", {
                    state: game.state,
                    date: game.stateDate
                });
                socket.emit("current_zone", {
                    begin: zoneManager.getCurrentZone(),
                    end: zoneManager.getNextZone(),
                    endDate: zoneManager.currentZoneEndDate,
                });
                socket.emit("settings", game.getSettings());
            }
        });

        socket.on("update_settings", (settings) => {
            if (!loggedIn) return;
            game.changeSettings(settings);
            secureAdminBroadcast("settings", game.getSettings());
        })

        socket.on("add_team", (teamName) => {
            if (!loggedIn) return;
            game.addTeam(teamName);
            secureAdminBroadcast("teams", game.teams);
        });

        socket.on("remove_team", (teamId) => {
            if (!loggedIn) return;
            game.removeTeam(teamId);
            secureAdminBroadcast("teams", game.teams);
        });

        socket.on("change_state", (state) => {
            if (!loggedIn) return;
            game.setState(state);
        });

        // Use is sending a new list containing the new order of the teams
        // Note that we never check if the new order contains the same teams as the old order, so it behaves more like a setTeams function
        // But the frontend should always send the same teams in a different order
        socket.on("reorder_teams", (newOrder) => {
            if (!loggedIn) return;
            game.reorderTeams(newOrder);
            secureAdminBroadcast("teams", game.teams);
            game.teams.forEach(t => sendUpdatedTeamInformations(t.id));
        });

        socket.on("update_team", (teamId, newTeam) => {
            if (!loggedIn) return;
            game.updateTeam(teamId, newTeam);
            secureAdminBroadcast("teams", game.teams);
            sendUpdatedTeamInformations(teamId);
            sendUpdatedTeamInformations(game.getTeam(teamId).chased);
        })
    });
}
