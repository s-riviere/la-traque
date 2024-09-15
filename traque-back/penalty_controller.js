/*
This module manages the verification of the game rules and the penalties.
*/
import { isInCircle } from "./map_utils.js";
import { sendUpdatedTeamInformations, teamBroadcast } from "./team_socket.js";
import { secureAdminBroadcast } from "./admin_socket.js";
import game, { GameState } from "./game.js";
import zone from "./zone_manager.js";

export default {
    // Object mapping team id to the date they left the zone as a UNIX millisecond timestamp
    outOfBoundsSince: {},
    // Id of the interval checking the rules
    checkIntervalId: null,
    settings: {
        //Time in minutes before a team is penalized for not updating their position
        allowedTimeOutOfZone: 10,
        //Time in minutes before a team is penalized for not updating their position
        allowedTimeBetweenPositionUpdate: 10,
        //Number of penalties needed to be eliminated
        maxPenalties: 3
    },

    /**
     * Start the penalty controller, watch the team positions and apply penalties if necessary
     */
    start() {
        this.outOfBoundsSince = {};
        if (this.checkIntervalId) {
            clearInterval(this.checkIntervalId)
        }
        //Watch periodically if all teams need are following the rules
        this.checkIntervalId = setInterval(() => {
            if (game.state == GameState.PLAYING) {
                this.watchPositionUpdate();
                this.watchZone();
            }
        }, 100);
    },

    /**
     * Stop the penalty controller
     */
    stop() {
        this.outOfBoundsSince = {};
        if (this.checkIntervalId) {
            clearInterval(this.checkIntervalId)
            this.checkIntervalId = null;
        }
    },

    /**
     * Update the penalty controller settings
     * @param {Object} newSettings the object containing the settings to be udpated, can be partial
     * @returns true if the settings were updated, false otherwise
     */
    updateSettings(newSettings) {
        //Sanitize input
        if (newSettings.maxPenalties && (isNaN(parseInt(newSettings.maxPenalties)) || newSettings.maxPenalties < 0)) { return false }
        if (newSettings.allowedTimeBetweenPositionUpdate && (isNaN(parseFloat(newSettings.allowedTimeBetweenPositionUpdate)) || newSettings.allowedTimeBetweenPositionUpdate < 0)) { return false }
        if (newSettings.allowedTimeOutOfZone && (isNaN(parseFloat(newSettings.allowedTimeOutOfZone)) || newSettings.allowedTimeOutOfZone < 0)) { return false }

        this.settings = { ...this.settings, ...newSettings };
        return true;
    },

    /**
     * Increment the penalty score of a team, send a message to the team and eliminated if necessary
     * @param {Number} teamId The team that will recieve a penalty
     */
    addPenalty(teamId) {
        let team = game.getTeam(teamId);
        if (!team) {
            return;
        }
        if (team.captured) {
            return;
        }
        team.penalties++;
        if (team.penalties >= this.settings.maxPenalties) {
            game.capture(team.id);
            sendUpdatedTeamInformations(teamId);
            sendUpdatedTeamInformations(team.chased);
            teamBroadcast(teamId, "warning", "You have been eliminated (reason: too many penalties)")
            teamBroadcast(team.chased, "success", "The team you were chasing has been eliminated")
        } else {
            teamBroadcast(teamId, "warning", `You recieved a penalty (${team.penalties}/${this.settings.maxPenalties})`)
            sendUpdatedTeamInformations(teamId);
        }
        secureAdminBroadcast("teams", game.teams)
    },

    /**
     * Check if each team has too many penalties and eliminate them if necessary
     * Also send a socket message to the team and the chased team
     */
    checkPenalties() {
        for (let team of game.teams) {
            if (team.penalties >= this.settings.maxPenalties) {
                game.capture(team.id);
                sendUpdatedTeamInformations(team.id);
                sendUpdatedTeamInformations(team.chased);
                teamBroadcast(team.id, "warning", "You have been eliminated (reason: too many penalties)")
                teamBroadcast(team.chased, "success", "The team you were chasing has been eliminated")
            }
        }
    },

    /**
     * Watch the position of each team and apply penalties if necessary
     * If a team is out of the zone, a warning will be sent to them
     * A warning is also sent one minute before the penalty is applied
     */
    watchZone() {
        game.teams.forEach((team) => {
            if (team.captured) { return }
            //All the informations are not ready yet
            if (team.currentLocation == null || zone.currentZone == null) {
                return;
            }
            if (!isInCircle({ lat: team.currentLocation[0], lng: team.currentLocation[1] }, zone.currentZone.center, zone.currentZone.radius)) {
                //The team was not previously out of the zone
                if (!this.outOfBoundsSince[team.id]) {
                    this.outOfBoundsSince[team.id] = new Date();
                    teamBroadcast(team.id, "warning", `You left the zone, you have ${this.settings.allowedTimeOutOfZone} minutes to get back in the marked area.`)
                } else if (new Date() - this.outOfBoundsSince[team.id] > this.settings.allowedTimeOutOfZone * 60 * 1000) {
                    this.addPenalty(team.id)
                    this.outOfBoundsSince[team.id] = new Date();
                } else if (Math.abs(new Date() - this.outOfBoundsSince[team.id] - (this.settings.allowedTimeOutOfZone - 1) * 60 * 1000) < 100) {
                    teamBroadcast(team.id, "warning", `You left the zone, you have 1 minutes to get back in the marked area.`)
                }
            } else {
                if (this.outOfBoundsSince[team.id]) {
                    delete this.outOfBoundsSince[team.id];
                }
            }
        })
    },

    /**
     * Watch the date of the last position update of each team and apply penalties if necessary
     * Also send a message one minute before the penalty is applied
     */
    watchPositionUpdate() {
        game.teams.forEach((team) => {
            //If the team has not sent their location for more than the allowed period, automatically send it and add a penalty
            if (team.captured) { return }
            if (team.locationSendDeadline == null) {
                team.locationSendDeadline = Number(new Date()) + this.settings.allowedTimeBetweenPositionUpdate * 60 * 1000;
                return;
            }
            if (new Date() > team.locationSendDeadline) {
                this.addPenalty(team.id);
                game.sendLocation(team.id);
                sendUpdatedTeamInformations(team.id);
                secureAdminBroadcast("teams", game.teams)
            } else if (Math.abs(new Date() - team.locationSendDeadline - 60 * 1000) < 100) {
                teamBroadcast(team.id, "warning", `You have one minute left to udpate your location.`)
            }
        })
    },
}