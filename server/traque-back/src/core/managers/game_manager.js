import { EventEmitter } from 'events';
import { ZoneManager } from "#core/managers/zone_manager.js";
import { TeamManager } from '#core/managers/team_manager.js';
import { GAME_MANAGER_EVENTS } from "#config/events.js";


export class GameManager extends EventEmitter {
    constructor(stateSettings, gameSettings) {
        super();
        // Data
        this.teams = new TeamManager();
        this.zoneManager = new ZoneManager();
        this.settings = gameSettings;
        // State
        this.state = null;
        this.transitionMatrix = stateSettings.TRANSITION_MATRIX;
        this.setState(stateSettings.ENTRY_STATE_CLASS);
    }
    

    // --------------- ACTIONS --------------- //

    // State

    setState(StateClass) {
        if (!this._canTransitionTo(StateClass)) return;
        this.state?.exit();
        this.state = new StateClass(this.teams, this.zoneManager);
        this.state.enter(this.settings);
        this.emit(GAME_MANAGER_EVENTS.UPDATE_GAME);
    }

    // Settings

    setSettings(settings) {
        this.settings = settings;
        this.state.applySettings(settings);
        this.zoneManager.updateZones(settings.playingZones);
        this.emit(GAME_MANAGER_EVENTS.UPDATE_GAME);
    }

    // Teams

    addTeam(teamName) {
        const team = this.teams.add(teamName);
        if (team == null) return false;
        this.state.initTeam(team);
        this.emit(GAME_MANAGER_EVENTS.UPDATE_GAME);
        return true;
    }
    
    removeTeam(teamId) {
        if (!this.teams.has(teamId)) return false;
        this.state.clearTeam(this.teams.get(teamId));
        this.teams.delete(teamId);
        this.emit(GAME_MANAGER_EVENTS.DELETE_TEAM, teamId);
        this.emit(GAME_MANAGER_EVENTS.UPDATE_GAME);
        return true;
    }

    reorderTeam(newTeamsOrder) {
        if (!this.teams.reorder(newTeamsOrder)) return false;
        this.emit(GAME_MANAGER_EVENTS.UPDATE_GAME);
        return true;
    }

    // Team state

    eliminate(teamId) {
        return this._teamAction(teamId, "eliminate");
    }

    revive(teamId) {
        return this._teamAction(teamId, "revive");
    }
    
    addHandicap(teamId) {
        return this._teamAction(teamId, "addHandicap");
    }
    
    clearHandicap(teamId) {
        return this._teamAction(teamId, "clearHandicap");
    }

    scan(teamId) {
        return this._teamAction(teamId, "scan");
    }

    capture(teamId, captureCode) {
        return this._teamAction(teamId, "capture", captureCode);
    }

    updateLocation(teamId, coords) {
        return this._teamAction(teamId, "updateLocation", coords);
    }


    // --------------- OTHER --------------- //

    // Login handlers

    onPlayerLogin(socketId, teamId) {
        this.emit(GAME_MANAGER_EVENTS.INIT_PLAYER, socketId, teamId);
    }

    onAdminLogin(socketId) {
        this.emit(GAME_MANAGER_EVENTS.INIT_ADMIN, socketId);
    }

    // Util

    _canTransitionTo(StateClass) {
        return this.state === null || this.transitionMatrix[this.state.name][StateClass.name](this.state);
    };

    _teamAction(teamId, actionName, ...args) {
        if (!this.teams.has(teamId) || typeof this.state[actionName] !== 'function') return false;
        const success = this.state[actionName](this.teams.get(teamId), ...args);
        this.emit(GAME_MANAGER_EVENTS.UPDATE_GAME);
        return success;
    }
}
