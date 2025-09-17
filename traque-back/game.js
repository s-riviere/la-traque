import { secureAdminBroadcast } from "./admin_socket.js";
import { teamBroadcast, playersBroadcast, sendUpdatedTeamInformations } from "./team_socket.js";
import { sendPositionTimeouts, outOfZoneTimeouts } from "./timeout_handler.js";
import zoneManager from "./zone_manager.js";
import trajectory from "./trajectory.js";

function randint(max) {
    return Math.floor(Math.random() * max);
}

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

function isInCircle(position, center, radius) {
    return getDistanceFromLatLon(position, center) < radius;
}

export const GameState = {
    SETUP: "setup",
    PLACEMENT: "placement",
    PLAYING: "playing",
    FINISHED: "finished"
}

export default {
    // List of teams, as objects. To see the fields see the addTeam method
    teams: [],
    // Current state of the game
    state: GameState.SETUP,
    // Date since the state changed
    startDate: null,
    // Messages
    messages: {
        waiting: "",
        captured: "",
        winner: "",
        loser: "",
    },



    /* ------------------------------- USEFUL FUNCTIONS ------------------------------- */

    getNewTeamId() {
        let id = randint(1_000_000);
        while (this.teams.find(t => t.id === id)) id = randint(1_000_000);
        return id;
    },

    checkEndGame() {
        if (this.teams.filter(team => !team.captured).length <= 2) this.setState(GameState.FINISHED);
    },

    updateChasingChain() {
        const playingTeams = this.teams.filter(team => !team.captured);

        for (let i = 0; i < playingTeams.length; i++) {
            playingTeams[i].chasing = playingTeams[(i+1) % playingTeams.length].id;
            playingTeams[i].chased = playingTeams[(playingTeams.length + i-1) % playingTeams.length].id;
            sendUpdatedTeamInformations(playingTeams[i].id);
        }
    },

    initLastSentLocations() {
        const dateNow = Date.now();
        // Update of lastSentLocation
        for (const team of this.teams) {
            team.lastSentLocation = team.currentLocation;
            team.locationSendDeadline = dateNow + sendPositionTimeouts.delay * 60 * 1000;
            sendPositionTimeouts.set(team.id);
            sendUpdatedTeamInformations(team.id);
        }
        // Update of enemyLocation now we have the lastSentLocation of the enemy
        for (const team of this.teams) {
            team.enemyLocation = this.getTeam(team.chasing)?.lastSentLocation;
            sendUpdatedTeamInformations(team.id);
        }
        // Broadcast new infos
        secureAdminBroadcast("teams", this.teams);
    },

    resetTeamsInfos() {
        for (const team of this.teams) {
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
            team.hasHandicap = false;
            // Stats
            team.distance = 0;
            team.nCaptures = 0;
            team.nSentLocation = 0;
            team.nObserved = 0;
            team.finishDate = null;
            sendUpdatedTeamInformations(team.id);
        }
        this.updateChasingChain();
        secureAdminBroadcast("teams", this.teams);
    },



    /* ------------------------------- STATE AND SETTINGS FUNCTIONS ------------------------------- */

    getAdminSettings() {
        return {
            messages: this.messages,
            zone: zoneManager.settings,
            sendPositionDelay: sendPositionTimeouts.delay,
            outOfZoneDelay: outOfZoneTimeouts.delay
        };
    },

    getPlayerSettings() {
        return {
            messages: this.messages,
            zone: {type: zoneManager.settings.type},
            sendPositionDelay: sendPositionTimeouts.delay,
            outOfZoneDelay: outOfZoneTimeouts.delay
        };
    },

    changeSettings(newSettings) {
        if ("messages" in newSettings) this.messages = {...this.messages, ...newSettings.messages};
        if ("zone" in newSettings) zoneManager.changeSettings(newSettings.zone);
        if ("sendPositionDelay" in newSettings) sendPositionTimeouts.setDelay(newSettings.sendPositionDelay);
        if ("outOfZoneDelay" in newSettings) outOfZoneTimeouts.setDelay(newSettings.outOfZoneDelay);
        // Broadcast new infos
        secureAdminBroadcast("settings", this.getAdminSettings());
        playersBroadcast("settings", this.getPlayerSettings());
    },

    setState(newState) {
        const dateNow = Date.now();
        if (newState == this.state) return true;
        switch (newState) {
            case GameState.SETUP:
                trajectory.stop();
                zoneManager.stop();
                sendPositionTimeouts.clearAll();
                outOfZoneTimeouts.clearAll();
                this.resetTeamsInfos();
                this.startDate = null;
                break;
            case GameState.PLACEMENT:
                if (this.state == GameState.FINISHED || this.teams.length < 3) {
                    secureAdminBroadcast("game_state", {state: this.state, date: this.startDate});
                    return false;
                }
                trajectory.stop();
                zoneManager.stop();
                sendPositionTimeouts.clearAll();
                outOfZoneTimeouts.clearAll();
                this.startDate = null;
                break;
            case GameState.PLAYING:
                if (this.state == GameState.FINISHED || this.teams.length < 3) {
                    secureAdminBroadcast("game_state", {state: this.state, date: this.startDate});
                    return false;
                }
                trajectory.start();
                zoneManager.start();
                this.initLastSentLocations();
                this.startDate = dateNow;
                break;
            case GameState.FINISHED:
                if (this.state != GameState.PLAYING) {
                    secureAdminBroadcast("game_state", {state: this.state, date: this.startDate});
                    return false;
                }
                trajectory.stop();
                zoneManager.stop();
                sendPositionTimeouts.clearAll();
                outOfZoneTimeouts.clearAll();
                this.teams.forEach(team => {if (!team.finishDate) team.finishDate = dateNow});
                secureAdminBroadcast("teams", this.teams);
                break;
        }
        // Update the state
        this.state = newState;
        // Broadcast new infos
        secureAdminBroadcast("game_state", {state: newState, date: this.startDate});
        playersBroadcast("game_state", {state: newState, date: this.startDate});
        return true;
    },



    /* ------------------------------- MANAGE PLAYERS FUNCTIONS ------------------------------- */

    addPlayer(teamId, socketId) {
        // Test of parameters
        if (!this.hasTeam(teamId)) return false;
        // Variables
        const team = this.getTeam(teamId);
        // Add the player
        team.sockets.push(socketId);
        // Broadcast new infos
        secureAdminBroadcast("teams", this.teams);
        return true;
    },

    removePlayer(teamId, socketId) {
        // Test of parameters
        if (!this.hasTeam(teamId)) return false;
        // Variables
        const team = this.getTeam(teamId);
        // Remove the player and its data
        if (this.isPlayerCapitain(teamId, socketId)) {
            team.battery = null;
            team.phoneModel = null;
            team.phoneName = null;
        }
        team.sockets = team.sockets.filter((sid) => sid != socketId);
        // Broadcast new infos
        secureAdminBroadcast("teams", this.teams);
        sendUpdatedTeamInformations(team.id);
        return true;
    },

    isPlayerCapitain(teamId, socketId) {
        return this.getTeam(teamId).sockets.indexOf(socketId) == 0;
    },



    /* ------------------------------- MANAGE TEAMS FUNCTIONS ------------------------------- */

    getTeam(teamId) {
        return this.teams.find(t => t.id === teamId);
    },

    hasTeam(teamId) {
        return this.teams.some(t => t.id === teamId);
    },

    addTeam(teamName) {
        this.teams.push({
            // Identification
            sockets: [],
            name: teamName,
            id: this.getNewTeamId(),
            captureCode: randint(10_000),
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
            hasHandicap: false,
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
        this.updateChasingChain();
        // Broadcast new infos
        secureAdminBroadcast("teams", this.teams);
        return true;
    },

    removeTeam(teamId) {
        // Test of parameters
        if (!this.hasTeam(teamId)) return false;
        // Logout the team
        teamBroadcast(teamId, "logout");
        this.teams = this.teams.filter(t => t.id !== teamId);
        sendPositionTimeouts.clear(teamId);
        outOfZoneTimeouts.clear(teamId);
        this.updateChasingChain();
        this.checkEndGame();
        // Broadcast new infos
        secureAdminBroadcast("teams", this.teams);
        return true;
    },

    updateTeam(teamId, newInfos) {
        // Test of parameters
        if (!this.hasTeam(teamId)) return false;
        // Update
        this.teams = this.teams.map(team => team.id == teamId ? {...team, ...newInfos} : team);
        // Broadcast new infos
        secureAdminBroadcast("teams", this.teams);
        sendUpdatedTeamInformations(teamId);
        return true;
    },

    switchCapturedTeam(teamId) {
        // Test of parameters
        if (!this.hasTeam(teamId)) return false;
        // Variables
        const team = this.getTeam(teamId);
        const dateNow = Date.now();
        // Switch team.captured
        if (this.state != GameState.PLAYING) return false;
        if (team.captured) {
            team.captured = false;
            team.finishDate = null;
            team.lastSentLocation = team.currentLocation;
            team.locationSendDeadline = dateNow + sendPositionTimeouts.delay * 60 * 1000;
            sendPositionTimeouts.set(team.id);
        } else {
            team.captured = true;
            team.finishDate = dateNow;
            team.chasing = null;
            team.chased = null;
            sendPositionTimeouts.clear(team.id);
            outOfZoneTimeouts.clear(team.id);
        }
        this.updateChasingChain();
        this.checkEndGame();
        // Broadcast new infos
        secureAdminBroadcast("teams", this.teams);
        sendUpdatedTeamInformations(team.id);
        return true;
    },

    placementTeam(teamId, placementZone) {
        // Test of parameters
        if (!this.hasTeam(teamId)) return false;
        // Variables
        const team = this.getTeam(teamId);
        // Make the capture
        team.startingArea = placementZone;
        // Broadcast new infos
        secureAdminBroadcast("teams", this.teams);
        sendUpdatedTeamInformations(team.id);
        return true;
    },

    reorderTeams(newOrder) {
        // Update teams
        const teamMap = new Map(this.teams.map(team => [team.id, team]));
        this.teams = newOrder.map(id => teamMap.get(id));
        this.updateChasingChain();
        // Broadcast new infos
        secureAdminBroadcast("teams", this.teams);
        return true;
    },

    handicapTeam(teamId) {
        // Test of parameters
        if (!this.hasTeam(teamId)) return false;
        // Variables
        const team = this.getTeam(teamId);
        // Make the capture
        team.hasHandicap = true;
        sendPositionTimeouts.clear(team.id);
        // Broadcast new infos
        secureAdminBroadcast("teams", this.teams);
        sendUpdatedTeamInformations(team.id);
        return true;
    },



    /* ------------------------------- PLAYERS ACTIONS FUNCTIONS ------------------------------- */

    updateLocation(teamId, location) {
        // Test of parameters
        if (!this.hasTeam(teamId)) return false;
        if (!this.hasTeam(this.getTeam(teamId).chasing)) return false;
        if (!location) return false;
        // Variables
        const team = this.getTeam(teamId);
        const enemyTeam = this.getTeam(team.chasing);
        const dateNow = Date.now();
        // Update distance
        if (this.state == GameState.PLAYING && team.currentLocation) {
            team.distance += Math.floor(getDistanceFromLatLon({lat: location[0], lng: location[1]}, {lat: team.currentLocation[0], lng: team.currentLocation[1]}));
        }
        // Update of currentLocation
        team.currentLocation = location;
        team.lastCurrentLocationDate = dateNow;
        if (this.state == GameState.PLAYING && team.hasHandicap) {
            team.lastSentLocation = team.currentLocation;
        }
        // Update of enemyLocation
        if (this.state == GameState.PLAYING && enemyTeam.hasHandicap) {
            team.enemyLocation = enemyTeam.currentLocation;
        }
        // Update of ready
        if (this.state == GameState.PLACEMENT && team.startingArea) {
            team.ready = isInCircle({ lat: location[0], lng: location[1] }, team.startingArea.center, team.startingArea.radius);
        }
        // Update out of zone
        if (this.state == GameState.PLAYING) {
            const teamCurrentlyOutOfZone = !zoneManager.isInZone({ lat: location[0], lng: location[1] })
            if (teamCurrentlyOutOfZone && !team.outOfZone) {
                team.outOfZone = true;
                team.outOfZoneDeadline = dateNow + outOfZoneTimeouts.delay * 60 * 1000;
                outOfZoneTimeouts.set(teamId);
            } else if (!teamCurrentlyOutOfZone && team.outOfZone) {
                team.outOfZone = false;
                team.outOfZoneDeadline = null;
                team.hasHandicap = false;
                if (!sendPositionTimeouts.has(team.id)) {
                    team.locationSendDeadline = dateNow + sendPositionTimeouts.delay * 60 * 1000;
                    sendPositionTimeouts.set(team.id);
                }
                outOfZoneTimeouts.clear(teamId);
            }
        }
        // Broadcast new infos
        secureAdminBroadcast("teams", this.teams);
        sendUpdatedTeamInformations(team.id);
        // Update of events of the game
        trajectory.writePosition(dateNow, team.id, location[0], location[1]);
        return true;
    },
    
    sendLocation(teamId) {
        // Conditions
        if (this.state != GameState.PLAYING) return false;
        // Test of parameters
        if (!this.hasTeam(teamId)) return false;
        if (!this.hasTeam(this.getTeam(teamId).chasing)) return false;
        // Variables
        const team = this.getTeam(teamId);
        const enemyTeam = this.getTeam(team.chasing);
        const dateNow = Date.now();
        // Update team
        team.nSentLocation++;
        team.lastSentLocation = team.currentLocation;
        team.enemyLocation = enemyTeam.lastSentLocation;
        team.locationSendDeadline = dateNow + sendPositionTimeouts.delay * 60 * 1000;
        sendPositionTimeouts.set(team.id);
        // Update enemy
        enemyTeam.nObserved++;
        // Broadcast new infos
        secureAdminBroadcast("teams", this.teams);
        sendUpdatedTeamInformations(team.id);
        sendUpdatedTeamInformations(enemyTeam.id);
        // Update of events of the game
        trajectory.writeSeePosition(dateNow, team.id, enemyTeam.id);
        return true;
    },

    tryCapture(teamId, captureCode) {
        // Conditions
        if (this.state != GameState.PLAYING) return false;
        // Test of parameters
        if (!this.hasTeam(teamId)) return false;
        if (!this.hasTeam(this.getTeam(teamId).chasing)) return false;
        // Variables
        const team = this.getTeam(teamId);
        const enemyTeam = this.getTeam(team.chasing);
        const dateNow = Date.now();
        // Verify the capture
        if (enemyTeam.captureCode != captureCode) return false;
        // Make the capture
        team.nCaptures++;
        enemyTeam.captured = true;
        enemyTeam.finishDate = dateNow;
        enemyTeam.chasing = null;
        enemyTeam.chased = null;
        sendPositionTimeouts.clear(enemyTeam.id);
        outOfZoneTimeouts.clear(enemyTeam.id);
        this.updateChasingChain();
        this.checkEndGame();
        // Broadcast new infos
        secureAdminBroadcast("teams", this.teams);
        sendUpdatedTeamInformations(team.id);
        sendUpdatedTeamInformations(enemyTeam.id);
        // Update of events of the game
        trajectory.writeCapture(dateNow, team.id, enemyTeam.id);
        return true;
    },
}
