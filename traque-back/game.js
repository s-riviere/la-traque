/*
This module manages the main game state, the teams, the settings and the game logic
*/
import { secureAdminBroadcast } from "./admin_socket.js";
import { playersBroadcast, sendUpdatedTeamInformations } from "./team_socket.js";
import timeoutHandler from "./timeoutHandler.js";
import penaltyController from "./penalty_controller.js";
import zoneManager from "./zone_manager.js";
import trajectory from "./trajectory.js";

/**
 * Compute the distance between two points givent their longitude and latitude 
 * @param {Object} pos1 The first position
 * @param {Object} pos2 The second position
 * @returns the distance between the two positions in meters
 * @see https://gist.github.com/miguelmota/10076960
 */
function getDistanceFromLatLon({ lat: lat1, lng: lon1 }, { lat: lat2, lng: lon2 }) {
    const degToRad = (deg) => deg * (Math.PI / 180);
    var R = 6371; // Radius of the earth in km
    var dLat = degToRad(lat2 - lat1);
    var dLon = degToRad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d * 1000;
}

/**
 * Check if a GPS point is in a circle
 * @param {Object} position The position to check, an object with lat and lng fields
 * @param {Object} center The center of the circle, an object with lat and lng fields
 * @param {Number} radius The radius of the circle in meters
 * @returns 
 */
function isInCircle(position, center, radius) {
    return getDistanceFromLatLon(position, center) < radius;
}

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
    // Date since gameState switched to PLAYING
    startDate: null,
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
        // Checks is the newState is a Gamestate
        if (Object.values(GameState).indexOf(newState) == -1) return false;
        // Match case
        switch (newState) {
            case GameState.SETUP:
                trajectory.stop();
                zoneManager.stop();
                penaltyController.stop();
                timeoutHandler.endAllSendPositionTimeout();
                for (let team of this.teams) {
                    team.outOfZone = false;
                    team.penalties = 0;
                    team.captured = false;
                    team.enemyLocation = null;
                    team.currentLocation = null;
                    team.lastSentLocation = null;
                    team.distance = 0;
                    team.finishDate = null;
                    team.nCaptures = 0;
                    team.nSentLocation = 0;
                    team.nObserved = 0;
                }
                this.startDate = null;
                this.updateTeamChasing();
                break;
            case GameState.PLACEMENT:
                if (this.teams.length < 3) {
                    secureAdminBroadcast("game_state", {state: this.state, startDate: this.startDate});
                    return false;
                }
                trajectory.stop();
                zoneManager.stop();
                penaltyController.stop();
                timeoutHandler.endAllSendPositionTimeout();
                this.startDate = null;
                break;
            case GameState.PLAYING:
                if (this.teams.length < 3) {
                    secureAdminBroadcast("game_state", {state: this.state, startDate: this.startDate});
                    return false;
                }
                trajectory.start();
                zoneManager.start();
                penaltyController.start();
                this.initLastSentLocations();
                this.startDate = Date.now();
                break;
            case GameState.FINISHED:
                if (this.state != GameState.PLAYING) {
                    secureAdminBroadcast("game_state", {state: this.state, startDate: this.startDate});
                    return false;
                }
                for (const team of this.teams) {
                    if (!team.finishDate) team.finishDate = Date.now();
                }
                trajectory.stop();
                zoneManager.stop();
                penaltyController.stop();
                timeoutHandler.endAllSendPositionTimeout();
                break;
        }
        // Update the state
        this.state = newState;
        secureAdminBroadcast("game_state", {state: newState, startDate: this.startDate});
        playersBroadcast("game_state", newState);
        secureAdminBroadcast("teams", this.teams);
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
            sockets: [],
            id: this.getNewTeamId(),
            name: teamName,
            chasing: null,
            chased: null,
            lastSentLocation: null,
            currentLocation: null,
            enemyLocation: null,
            locationSendDeadline: null,
            startingArea: null,
            ready: false,
            captureCode: this.createCaptureCode(),
            captured: false,
            penalties: 0,
            outOfZone: false,
            outOfZoneDeadline: null,
            distance: 0,
            finishDate: null,
            nCaptures: 0,
            nSentLocation: 0,
            nObserved: 0,
            phoneModel: null,
            phoneName: null,
            battery: null,
            ping: null,
            nConnected: 0,
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
     * This function will update the chasing and chased values of each teams
     * @returns true if successful
     */
    updateTeamChasing() {
        if (this.playingTeamCount() <= 2) {
            if (this.state == GameState.PLAYING) {
                this.setState(GameState.FINISHED);
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
                } else {
                    firstTeam = this.teams[i].id;
                }
                previousTeam = this.teams[i].id;
            }
        }
        this.getTeam(firstTeam).chased = previousTeam;
        this.getTeam(previousTeam).chasing = firstTeam;
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
        if (team.currentLocation) team.distance += Math.floor(getDistanceFromLatLon({lat: location[0], lng: location[1]}, {lat: team.currentLocation[0], lng: team.currentLocation[1]}));
        // Update of events of the game
        trajectory.writePosition(Date.now(), teamId, location[0], location[1]);
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
        // Update of lastSentLocation
        for (const team of this.teams) {
            team.lastSentLocation = team.currentLocation;
            team.locationSendDeadline = Date.now() + penaltyController.settings.allowedTimeBetweenPositionUpdate * 60 * 1000;
            timeoutHandler.setSendPositionTimeout(team.id, team.locationSendDeadline);
            sendUpdatedTeamInformations(team.id);
        }
        // Update of enemyLocation now we have the lastSentLocation of the enemy
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
        const enemyTeam = this.getTeam(team.chasing);
        if (!team || !team.currentLocation) {
            return false;
        }
        team.nSentLocation++;
        enemyTeam.nObserved++;
        const dateNow = Date.now();
        // Update of events of the game
        trajectory.writeSeePosition(dateNow, teamId, team.chasing);
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
        sendUpdatedTeamInformations(enemyTeam.id);
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
        team.nCaptures++;
        // Update of events of the game
        trajectory.writeCapture(Date.now(), teamId, enemyTeam.id);
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
        const team = this.getTeam(teamId);
        team.captured = true;
        team.finishDate = Date.now();
        timeoutHandler.endSendPositionTimeout(teamId);
        this.updateTeamChasing();
    },
}