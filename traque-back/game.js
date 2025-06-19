/*
This module manages the main game state, the teams, the settings and the game logic
*/
import { secureAdminBroadcast } from "./admin_socket.js";
import { playersBroadcast, sendUpdatedTeamInformations } from "./team_socket.js";
import { isInCircle } from "./map_utils.js";
import timeoutHandler from "./timeoutHandler.js";
import penaltyController from "./penalty_controller.js";
import zoneManager from "./zone_manager.js";
import { writePosition, writeCapture, writeSeePosition } from "./trajectory.js";

/**
 * The possible states of the game
 */
export const GameState = {
    SETUP: "setup",
    PLACEMENT: "placement",
    PLAYING: "playing",
    FINISHED: "finished"
}

export default {
    //List of teams, as objects. To see the fields see the addTeam methods
    teams: [],
    //Current state of the game
    state: GameState.SETUP,
    //Settings of the game
    settings: {
        loserEndGameMessage: "",
        winnerEndGameMessage: "",
        capturedMessage: "",
        waitingMessage: ""
    },

    /**
     * Update the game settings
     * @param {Object} newSettings settings to be updated, can be partial
     * @returns true if the settings are applied
     */
    changeSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        return true;
    },

    /**
     * Change the state of the game to newState and start the necessary processes
     * @param {String} newState 
     * @returns true if the state has been changed
     */
    setState(newState) {
        if (Object.values(GameState).indexOf(newState) == -1) {
            return false;
        }
        //The game has started
        if (newState == GameState.PLAYING) {
            penaltyController.start();
            if (!zoneManager.ready()) {
                return false;
            }
            this.initLastSentLocations();
            zoneManager.reset()
            //If the zone cannot be setup, reset everything
            if (!zoneManager.start()) {
                this.setState(GameState.SETUP);
                return;
            }
        }
        if (newState != GameState.PLAYING) {
            zoneManager.reset();
            penaltyController.stop();
            timeoutHandler.endAllSendPositionTimeout();
        }
        //Game reset
        if (newState == GameState.SETUP) {
            for (let team of this.teams) {
                team.penalties = 0;
                team.captured = false;
                team.enemyLocation = null;
                team.enemyName = null;
                team.currentLocation = null;
                team.lastSentLocation = null;
            }
            this.updateTeamChasing();
        }
        this.state = newState;
        return true;
    },

    /**
     * Get a new unused team id
     * @returns a new unique team id
     */
    getNewTeamId() {
        let id = null;
        while (id === null || this.teams.find(t => t.id === id)) {
            id = Math.floor(Math.random() * 1_000_000);
        }
        return id;
    },

    /**
     * Return a random capture code
     * @returns a random 4 digit number
     */
    createCaptureCode() {
        return Math.floor(Math.random() * 10000);
    },

    /**
     * Add a new team to the game
     * @param {String} teamName the name of the team
     * @returns true if the team has been added
     */
    addTeam(teamName) {
        this.teams.push({
            id: this.getNewTeamId(),
            name: teamName,
            chasing: null,
            chased: null,
            currentLocation: null,
            lastSentLocation: null,
            locationSendDeadline: null,
            enemyLocation: null,
            enemyName: null,
            captureCode: this.createCaptureCode(),
            sockets: [],
            startingArea: null,
            ready: false,
            captured: false,
            penalties: 0,
        });
        this.updateTeamChasing();
        return true;
    },

    /**
     * Count the number of teams that are not captured
     * @returns the number of teams that are not captured
     */
    playingTeamCount() {
        let res = 0;
        this.teams.forEach((t) => {
            if (!t.captured) {
                res++;
            }
        })
        return res;
    },

    /**
     * Update the chasing chain of the teams based of the ordre of the teams array
     * If there are only 2 teams left, the game will end
     * This function will update the enemyName, chasing and chased values of each teams
     * @returns true if successful
     */
    updateTeamChasing() {
        if (this.playingTeamCount() <= 2) {
            if (this.state == GameState.PLAYING) {
                this.finishGame();
            }
            return false;
        }
        let firstTeam = null;
        let previousTeam = null
        for (let i = 0; i < this.teams.length; i++) {
            if (!this.teams[i].captured) {
                if (previousTeam != null) {
                    this.teams[i].chased = previousTeam;
                    this.getTeam(previousTeam).chasing = this.teams[i].id;
                    this.getTeam(previousTeam).enemyName = this.teams[i].name;
                } else {
                    firstTeam = this.teams[i].id;
                }
                previousTeam = this.teams[i].id;
            }
        }
        this.getTeam(firstTeam).chased = previousTeam;
        this.getTeam(previousTeam).chasing = firstTeam;
        this.getTeam(previousTeam).enemyName = this.getTeam(firstTeam).name;
        secureAdminBroadcast("teams", this.teams);
        return true;
    },

    /**
     * Rearrange the order of the teams and update the chasing chain
     * @param {Array} newOrder An array of teams in the new order
     * @returns 
     */
    reorderTeams(newOrder) {
        this.teams = newOrder;
        return this.updateTeamChasing();
    },

    /**
     * Get a team by its ID
     * @param {Number} teamId The id of the team
     * @returns the team object or undefined if not found
     */
    getTeam(teamId) {
        return this.teams.find(t => t.id === teamId);
    },

    /**
     * Update a team's values
     * @param {Number} teamId The id of the team to update
     * @param {Object} newTeam An object containing the new values of the team, can be partial
     * @returns true if the team has been updated
     */
    updateTeam(teamId, newTeam) {
        this.teams = this.teams.map((t) => {
            if (t.id == teamId) {
                return { ...t, ...newTeam };
            } else {
                return t;
            }
        })
        this.updateTeamChasing();
        penaltyController.checkPenalties();
        return true;
    },

    /**
     * 
     * @param {Number} teamId The ID of the team which location will be updated
     * @param {Array} location An array containing in order the latitude and longitude of the new location
     * @returns true if the location has been updated 
     */
    updateLocation(teamId, location) {
        const team = this.getTeam(teamId);
        if (!team || !location) {
            return false;
        }
        // Update of events of the game
        writePosition(Date.now(), teamId, location[0], location[1]);
        // Update of currentLocation
        team.currentLocation = location;
        // Update of ready (true if the team is in the starting area)
        if (this.state == GameState.PLACEMENT && team.startingArea && team.startingArea && location) {
            team.ready = isInCircle({ lat: location[0], lng: location[1] }, team.startingArea.center, team.startingArea.radius);
        }
        // Sending new infos to the team
        sendUpdatedTeamInformations(team.id);
        return true;
    },

    /**
     * Initialize the last sent location of the teams to their starting location
     */
    initLastSentLocations() {
        for (const team of this.teams) {
            team.lastSentLocation = team.currentLocation;
            team.locationSendDeadline = Date.now() + penaltyController.settings.allowedTimeBetweenPositionUpdate * 60 * 1000;
            timeoutHandler.setSendPositionTimeout(team.id, team.locationSendDeadline);
            this.getTeam(team.chasing).enemyLocation = team.lastSentLocation;
            sendUpdatedTeamInformations(team.id);
        }
        for (const team of this.teams) {
            team.enemyLocation = this.getTeam(team.chasing).lastSentLocation;
            sendUpdatedTeamInformations(team.id);
        }
    },

    /**
     * Get the most recent enemy team's location as well as setting the latest accessible location to the current one
     * @param {Number} teamId The ID of the team that will send its location
     * @returns true if the location has been sent
     */
    sendLocation(teamId) {
        const team = this.getTeam(teamId);
        if (!team || !team.currentLocation) {
            return false;
        }
        const dateNow = Date.now();
        // Update of events of the game
        writeSeePosition(dateNow, teamId, team.chasing);
        // Update of locationSendDeadline
        team.locationSendDeadline = dateNow + penaltyController.settings.allowedTimeBetweenPositionUpdate * 60 * 1000;
        timeoutHandler.setSendPositionTimeout(team.id, team.locationSendDeadline);
        // Update of lastSentLocation
        team.lastSentLocation = team.currentLocation;
        // Update of enemyLocation
        const teamChasing = this.getTeam(team.chasing);
        if (teamChasing) team.enemyLocation = teamChasing.lastSentLocation;
        // Sending new infos to the team
        sendUpdatedTeamInformations(team.id);
        return true;
    },

    /**
     * Remove a team by its ID
     * @param {Number} teamId The id of the team to remove
     * @returns true if the team has been deleted
     */
    removeTeam(teamId) {
        if (!this.getTeam(teamId)) {
            return false;
        }
        this.teams = this.teams.filter(t => t.id !== teamId);
        this.updateTeamChasing();
        timeoutHandler.endSendPositionTimeout(teamId);
        return true;
    },

    /**
     * Request a capture initiated by the team with id teamId (the one trying to capture)
     * If the captureCode match, the team chased by teamId will be set to captured
     * And the chase chain will be updated
     * @param {Number} teamId The id of the capturing team
     * @param {Number} captureCode The code sent by the capturing that only the captured team know, used to verify the authenticity of the capture
     * @returns {Boolean} if the capture has been successfull or not
     */
    requestCapture(teamId, captureCode) {
        const team = this.getTeam(teamId);
        const enemyTeam = this.getTeam(team.chasing);
        if (!enemyTeam || enemyTeam.captureCode != captureCode) {
            return false;
        }
        // Update of events of the game
        writeCapture(Date.now(), teamId, enemyTeam.id);
        // Update of capture and chasing cycle
        this.capture(enemyTeam.id);
        // Sending new infos to the teams
        sendUpdatedTeamInformations(team.id);
        sendUpdatedTeamInformations(enemyTeam.id);
        return true;
    },

    /**
     * Set a team to captured and update the chase chain
     * @param {Number} teamId the Id of the captured team
     */
    capture(teamId) {
        this.getTeam(teamId).captured = true;
        timeoutHandler.endSendPositionTimeout(teamId);
        this.updateTeamChasing();
    },

    /**
     * Change the settings of the Zone manager
     * The game should not be in PLAYING or FINISHED state
     * @param {Object} newSettings The object containing the settings to be changed
     * @returns false if failed
     */
    setZoneSettings(newSettings) {
        if ('min' in newSettings || 'max' in newSettings) {
            const min = newSettings.min ?? zoneManager.zoneSettings.min;
            const max = newSettings.max ?? zoneManager.zoneSettings.max;
            // The end zone must be included in the start zone
            if (!isInCircle(min.center, max.center, max.radius-min.radius)) {
                return false;
            }
        }
        zoneManager.udpateSettings(newSettings);
        if (this.state == GameState.PLAYING || this.state == GameState.FINISHED) {
            zoneManager.reset()
            if (!zoneManager.start()) {
                this.setState(GameState.SETUP);
                return false;
            }
        }
        return true;
    },

    /**
     * Set the game state as finished, as well as resetting the zone manager
     */
    finishGame() {
        this.setState(GameState.FINISHED);
        zoneManager.reset();
        timeoutHandler.endAllSendPositionTimeout();
        playersBroadcast("game_state", this.state);
    },
}