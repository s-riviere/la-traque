import { io } from "./index.js";
import { createHash } from "crypto";
import { config } from "dotenv";
import game from "./game.js"
import zoneManager from "./zone_manager.js"

config();

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

export function secureAdminBroadcast(event, data) {
    loggedInSockets.forEach(s => {
        io.of("admin").to(s).emit(event, data);
    });
}

let loggedInSockets = [];

export function initAdminSocketHandler() {
    io.of("admin").on("connection", (socket) => {
        console.log("Connection of an admin");
        let loggedIn = false;

        const login = (password) => {
            if (loggedIn) return false;
            if (createHash('sha256').update(password).digest('hex') !== ADMIN_PASSWORD_HASH) return false;
            loggedInSockets.push(socket.id);
            loggedIn = true;
            return true;
        }

        const logout = () => {
            if (!loggedIn) return false;
            loggedInSockets = loggedInSockets.filter(s => s !== socket.id);
            loggedIn = false;
            return true;
        }

        socket.on("disconnect", () => {
            console.log("Disconnection of an admin");
            logout();
        });

        socket.on("logout", () => {
            logout();
        });

        socket.on("login", (password) => {
            if (!login(password)) return;
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
        });

        socket.on("add_team", (teamName) => {
            if (!loggedIn) return;
            game.addTeam(teamName);
        });

        socket.on("remove_team", (teamId) => {
            if (!loggedIn) return;
            game.removeTeam(teamId);
        });

        socket.on("reorder_teams", (newOrder) => {
            if (!loggedIn) return;
            game.reorderTeams(newOrder);
        });

        socket.on("capture_team", (teamId, newTeam) => {
            if (!loggedIn) return;
            game.captureTeam(teamId, newTeam);
        });

        socket.on("change_state", (state) => {
            if (!loggedIn) return;
            game.setState(state);
        });

        socket.on("update_settings", (settings) => {
            if (!loggedIn) return;
            game.changeSettings(settings);
        });
    });
}
