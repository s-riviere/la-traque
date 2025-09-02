/*
This module manages the admin access to the server via websocket.
It receives messages, checks permissions, manages authentication and performs actions by calling functions from other modules.
This module also exposes functions to send messages via socket to all admins
*/
import { io } from "./index.js";
import game from "./game.js"
import zoneManager from "./zone_manager.js"
import penaltyController from "./penalty_controller.js";
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
    // Admin namespace
    io.of("admin").on("connection", (socket) => {
        // Flag to check if the user is logged in, defined for each socket
        console.log("Connection of an admin");
        let loggedIn = false;

        socket.on("disconnect", () => {
            console.log("Disconnection of an admin");
            // Remove the socket from the logged in sockets array
            loggedInSockets = loggedInSockets.filter(s => s !== socket.id);
        });

        socket.on("logout", () => {
            loggedInSockets = loggedInSockets.filter(s => s !== socket.id);
        })

        // User is attempting to log in
        socket.on("login", (password) => {
            const hash = createHash('sha256').update(password).digest('hex');
            if (hash === ADMIN_PASSWORD_HASH && !loggedIn) {
                // Attempt successful
                socket.emit("login_response", true);
                loggedInSockets.push(socket.id);
                loggedIn = true;
                // Send the current state
                socket.emit("game_state", {state: game.state, startDate: game.startDate})
                // Other settings that need initialization
                socket.emit("penalty_settings", penaltyController.settings)
                socket.emit("game_settings", game.settings)
                socket.emit("zone_settings", zoneManager.settings)
                socket.emit("current_zone", {
                    begin: zoneManager.getCurrentZone(),
                    end: zoneManager.getNextZone(),
                    endDate: zoneManager.currentZoneEndDate,
                })
            } else {
                // Attempt unsuccessful
                socket.emit("login_response", false);
            }
        });

        socket.on("set_game_settings", (settings) => {
            if (!loggedIn) {
                socket.emit("error", "Not logged in");
                return;
            }
            if (!game.changeSettings(settings)) {
                socket.emit("error", "Invalid settings");
                socket.emit("game_settings", penaltyController.settings)
            } else {
                secureAdminBroadcast("game_settings", game.settings);
                playersBroadcast("game_settings", game.settings);
            }
        })

        socket.on("set_zone_settings", (settings) => {
            if (!loggedIn) {
                socket.emit("error", "Not logged in");
                return;
            }
            if (!zoneManager.changeSettings(settings)) {
                socket.emit("error", "Error changing zone");
                socket.emit("zone_settings", settings)
            } else {
                secureAdminBroadcast("zone_settings", settings)
            }

        })

        socket.on("set_penalty_settings", (settings) => {
            if (!loggedIn) {
                socket.emit("error", "Not logged in");
                return;
            }
            if (!penaltyController.updateSettings(settings)) {
                socket.emit("error", "Invalid settings");
                socket.emit("penalty_settings", penaltyController.settings)
            } else {
                secureAdminBroadcast("penalty_settings", penaltyController.settings)
            }

        })

        // User is attempting to add a new team
        socket.on("add_team", (teamName) => {
            if (!loggedIn) {
                socket.emit("error", "Not logged in");
                return;
            }
            if (game.addTeam(teamName)) {
                secureAdminBroadcast("teams", game.teams);
            } else {
                socket.emit("error", "Error adding team");
            }
        });

        // User is attempting to remove a team
        socket.on("remove_team", (teamId) => {
            if (!loggedIn) {
                socket.emit("error", "Not logged in");
                return;
            }
            if (game.removeTeam(teamId)) {
                secureAdminBroadcast("teams", game.teams);
            } else {
                socket.emit("error", "Error removing team");
            }
        });

        // User is attempting to change the game state
        socket.on("change_state", (state) => {
            if (!loggedIn) {
                socket.emit("error", "Not logged in");
                return;
            }
            if (!game.setState(state)) {
                socket.emit("error", "Error setting state");
            }
        });

        // Use is sending a new list containing the new order of the teams
        // Note that we never check if the new order contains the same teams as the old order, so it behaves more like a setTeams function
        // But the frontend should always send the same teams in a different order
        socket.on("reorder_teams", (newOrder) => {
            if (!loggedIn) {
                socket.emit("error", "Not logged in");
                return;
            }
            if (game.reorderTeams(newOrder)) {
                secureAdminBroadcast("teams", game.teams);
                game.teams.forEach(t => sendUpdatedTeamInformations(t.id))
            } else {
                socket.emit("error", "Error reordering teams");
            }
        });

        socket.on("update_team", (teamId, newTeam) => {
            if (!loggedIn) {
                socket.emit("error", "Not logged in");
                return;
            }
            if (game.updateTeam(teamId, newTeam)) {
                secureAdminBroadcast("teams", game.teams);
                sendUpdatedTeamInformations(teamId)
                sendUpdatedTeamInformations(game.getTeam(teamId).chased)
            }
        })

        // Request an update of the team list
        // We only reply to the sender to prevent spam
        socket.on("get_teams", () => {
            if (!loggedIn) {
                socket.emit("error", "Not logged in");
                return;
            }
            socket.emit("teams", game.teams);
        });
    });
}
