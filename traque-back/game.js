/*
This module manages the main game state, the teams, the settings and the game logic
*/
import { secureAdminBroadcast } from "./admin_socket.js";
import { teamBroadcast, playersBroadcast, sendUpdatedTeamInformations,  } from "./team_socket.js";
import { sendPositionTimeouts, outOfZoneTimeouts } from "./timeout_handler.js";
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
    // List of teams, as objects. To see the fields see the addTeam methods
    teams: [],
    // Current state of the game
    state: GameState.SETUP,
    // Date since the state changed
    stateDate: Date.now(),
    // Messages
    messages: {
        waiting: "",
        captured: "",
        winner: "",
        loser: "",
    },

    getSettings() {
        return {
            messages: this.messages,
            zone: zoneManager.settings,
            sendPositionDelay: sendPositionTimeouts.delay,
            outOfZoneDelay: outOfZoneTimeouts.delay
        };
    },

    /**
     * Update the game settings
     * @param {Object} newSettings settings to be updated, can be partial
     */
    changeSettings(newSettings) {
        if ("messages" in newSettings) this.messages = {...this.messages, ...newSettings.messages};
        if ("zone" in newSettings) zoneManager.changeSettings(newSettings.zone);
        if ("sendPositionDelay" in newSettings) sendPositionTimeouts.setDelay(newSettings.sendPositionDelay);
        if ("outOfZoneDelay" in newSettings) outOfZoneTimeouts.setDelay(newSettings.outOfZoneDelay);
    },

    /**
     * Change the state of the game to newState and start the necessary processes
     * @param {String} newState 
     */
    setState(newState) {
        // Checks is the newState is a Gamestate
        if (Object.values(GameState).indexOf(newState) == -1) return false;
        // Match case
        switch (newState) {
            case GameState.SETUP:
                trajectory.stop();
                zoneManager.stop();
                sendPositionTimeouts.clearAll();
                outOfZoneTimeouts.clearAll();
                for (let team of this.teams) {
                    // Chasing
                    team.captured = false;
                    team.chasing = null;
                    team.chased = null;
                    // Locations
                    team.lastSentLocation = null;
                    team.locationSendDeadline = null;
                    team.enemyLocation = null;
                    // Placement
                    team.ready = false;
                    // Zone
                    team.outOfZone = false;
                    team.outOfZoneDeadline = null;
                    // Stats
                    team.distance = 0;
                    team.nCaptures = 0;
                    team.nSentLocation = 0;
                    team.nObserved = 0;
                    team.finishDate = null;
                }
                this.stateDate = Date.now();
                this.updateTeamChasing();
                break;
            case GameState.PLACEMENT:
                if (this.teams.length < 3) {
                    secureAdminBroadcast("game_state", {state: this.state, stateDate: this.stateDate});
                    return false;
                }
                trajectory.stop();
                zoneManager.stop();
                sendPositionTimeouts.clearAll();
                outOfZoneTimeouts.clearAll();
                this.stateDate = Date.now();
                break;
            case GameState.PLAYING:
                if (this.teams.length < 3) {
                    secureAdminBroadcast("game_state", {state: this.state, stateDate: this.stateDate});
                    return false;
                }
                trajectory.start();
                zoneManager.start();
                this.initLastSentLocations();
                this.stateDate = Date.now();
                break;
            case GameState.FINISHED:
                if (this.state != GameState.PLAYING) {
                    secureAdminBroadcast("game_state", {state: this.state, stateDate: this.stateDate});
                    return false;
                }
                for (const team of this.teams) {
                    if (!team.finishDate) team.finishDate = Date.now();
                }
                trajectory.stop();
                zoneManager.stop();
                sendPositionTimeouts.clearAll();
                outOfZoneTimeouts.clearAll();
                break;
        }
        // Update the state
        this.state = newState;
        secureAdminBroadcast("game_state", {state: newState, stateDate: this.stateDate});
        playersBroadcast("game_state", newState);
        secureAdminBroadcast("teams", this.teams);
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
     */
    addTeam(teamName) {
        this.teams.push({
            // Identification
            sockets: [],
            name: teamName,
            id: this.getNewTeamId(),
            captureCode: this.createCaptureCode(),
            // Chasing
            captured: false,
            chasing: null,
            chased: null,
            // Locations
            lastSentLocation: null,
            locationSendDeadline: null,
            currentLocation: null,
            lastCurrentLocationDate: null,
            enemyLocation: null,
            // Placement
            startingArea: null,
            ready: false,
            // Zone
            outOfZone: false,
            outOfZoneDeadline: null,
            // Stats
            distance: 0,
            nCaptures: 0,
            nSentLocation: 0,
            nObserved: 0,
            finishDate: null,
            // First socket infos
            phoneModel: null,
            phoneName: null,
            battery: null,
        });
        this.updateTeamChasing();
    },

    /**
     * Update the chasing chain of the teams based of the ordre of the teams array
     * If there are only 2 teams left, the game will end
     * This function will update the chasing and chased values of each teams
     */
    updateTeamChasing() {
        const playingTeams = this.teams.reduce((count, team) => count + (!team.captured ? 1 : 0), 0);
        if (playingTeams <= 2) {
            if (this.state == GameState.PLAYING) this.setState(GameState.FINISHED);
            return;
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
    },

    /**
     * Rearrange the order of the teams and update the chasing chain
     * @param {Array} newOrder An array of teams in the new order
     */
    reorderTeams(newOrder) {
        this.teams = newOrder;
        this.updateTeamChasing();
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
    },

    /**
     * 
     * @param {Number} teamId The ID of the team which location will be updated
     * @param {Array} location An array containing in order the latitude and longitude of the new location
     */
    updateLocation(teamId, location) {
        const team = this.getTeam(teamId);
        if (!team || !location) {
            return;
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
        // Verify zone
        const teamCurrentlyOutOfZone = !zoneManager.isInZone({ lat: location[0], lng: location[1] })
        if (teamCurrentlyOutOfZone && !team.outOfZone) {
            team.outOfZone = true;
            team.outOfZoneDeadline = Date.now() + outOfZoneTimeouts.duration * 60 * 1000;
            outOfZoneTimeouts.set(teamId);
        } else if (!teamCurrentlyOutOfZone && team.outOfZone) {
            team.outOfZone = false;
            team.outOfZoneDeadline = null;
            outOfZoneTimeouts.clear(teamId);
        }
        // Sending new infos to the team
        sendUpdatedTeamInformations(team.id);
    },

    /**
     * Initialize the last sent location of the teams to their starting location
     */
    initLastSentLocations() {
        // Update of lastSentLocation
        for (const team of this.teams) {
            team.lastSentLocation = team.currentLocation;
            team.locationSendDeadline = Date.now() + sendPositionTimeouts.duration * 60 * 1000;
            sendPositionTimeouts.set(team.id);
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
     */
    sendLocation(teamId) {
        const team = this.getTeam(teamId);
        if (!team || !team.currentLocation) {
            return;
        }
        const enemyTeam = this.getTeam(team.chasing);
        team.nSentLocation++;
        enemyTeam.nObserved++;
        const dateNow = Date.now();
        // Update of events of the game
        trajectory.writeSeePosition(dateNow, teamId, team.chasing);
        // Update of locationSendDeadline
        team.locationSendDeadline = dateNow + sendPositionTimeouts.duration * 60 * 1000;
        sendPositionTimeouts.set(team.id);
        // Update of lastSentLocation
        team.lastSentLocation = team.currentLocation;
        // Update of enemyLocation
        const teamChasing = this.getTeam(team.chasing);
        if (teamChasing) team.enemyLocation = teamChasing.lastSentLocation;
        // Sending new infos to the team
        sendUpdatedTeamInformations(team.id);
        sendUpdatedTeamInformations(enemyTeam.id);
    },

    /**
     * Remove a team by its ID
     * @param {Number} teamId The id of the team to remove
     */
    removeTeam(teamId) {
        if (!this.getTeam(teamId)) {
            return;
        }
        teamBroadcast("logout");
        this.teams = this.teams.filter(t => t.id !== teamId);
        this.updateTeamChasing();
        sendPositionTimeouts.clear(teamId);
        outOfZoneTimeouts.clear(teamId);
    },

    /**
     * Request a capture initiated by the team with id teamId (the one trying to capture)
     * If the captureCode match, the team chased by teamId will be set to captured
     * And the chase chain will be updated
     * @param {Number} teamId The id of the capturing team
     * @param {Number} captureCode The code sent by the capturing that only the captured team know, used to verify the authenticity of the capture
     */
    requestCapture(teamId, captureCode) {
        const team = this.getTeam(teamId);
        const enemyTeam = this.getTeam(team.chasing);
        if (!enemyTeam || enemyTeam.captureCode != captureCode) {
            return;
        }
        team.nCaptures++;
        // Update of events of the game
        trajectory.writeCapture(Date.now(), teamId, enemyTeam.id);
        // Update of capture and chasing cycle
        this.capture(enemyTeam.id);
        // Sending new infos to the teams
        sendUpdatedTeamInformations(team.id);
        sendUpdatedTeamInformations(enemyTeam.id);
    },

    /**
     * Set a team to captured and update the chase chain
     * @param {Number} teamId the Id of the captured team
     */
    capture(teamId) {
        const team = this.getTeam(teamId);
        team.captured = true;
        team.finishDate = Date.now();
        sendPositionTimeouts.clear(teamId);
        outOfZoneTimeouts.clear(teamId);
        this.updateTeamChasing();
    },

    handicapTeam(teamId) {
        // TODO
    }
}
