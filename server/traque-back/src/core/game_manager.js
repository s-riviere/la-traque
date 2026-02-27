import { Team } from "@/team/team.js";
import { randint } from "@/util/util.js";
import zoneManager from "./zone_manager.js"
import { EventEmitter } from 'events';
import { EVENTS } from "@/socket/playerHandler.js";
import { DefaultState } from "@/states/default_state.js";
import { CircularMap } from "@/util/circular_map.js";


const isTeamNameValide = (teamName) => {
    if (typeof teamName !== 'string') return false;
    if (teamName.length === 0) return false;
    return true;
};

const getNewTeamId = (teams) => {
    const idLength = 6;
    let newTeamId;
    do {
        newTeamId = randint(10 ** idLength);
    } while (teams.has(newTeamId));
    return newTeamId.toString().padStart(idLength, '0');
};



class GameManager extends EventEmitter {
    constructor() {
        super();
        this.currentState = new DefaultState(this);
        this.teams = new CircularMap();
        this.settings = {
            zone: zoneManager.settings,
            scanDelay: 10 * 60 * 1000, // ms
            outOfZoneDelay: 5 * 60 * 1000 // ms
        }
    }
    

    // State

    setState(StateClass) {
        this.currentState.exit();
        this.currentState = new StateClass(this);
        this.currentState.enter();
    }


    // Settings

    setSettings(settings) {
        // Zones
        zoneManager.changeSettings(settings.zone);
        this.settings.zone = zoneManager.settings; // TODO : not have two copies of the same object
        // Delays
        this.settings.scanDelay = settings.scanDelay;
        this.settings.outOfZoneDelay = settings.outOfZoneDelay;
    }


    // Emits

    emitTeamUpdate(target, team) {
        this.emit(EVENTS.INTERNAL.TEAM_UPDATE, target, this.currentState.getTeamMapForTeam(team));
    }

    emitLogout(target) {
        this.emit(EVENTS.INTERNAL.LOGOUT, target);
    }


    // Actions

    //// Boilerplates

    _performOnTeam(actionName, teamId, ...args) {
        if (!this.teams.has(teamId)) return false;
        const team = this.teams.get(teamId);
        return this.currentState[actionName](team, ...args);
    }

    //// All states

    addTeam(teamName) {
        if (!isTeamNameValide(teamName)) return false;
        const teamId = getNewTeamId(this.teams);
        const team = new Team(teamId, teamName);
        this.teams.set(teamId, team);
        this.currentState.initTeamContext(team);
        this.currentState.onTeamOrderChange();
        return true;
    }
    
    removeTeam(teamId) {
        if (!this.teams.has(teamId)) return false;
        this.emitLogout(teamId);
        this.currentState.clearTeamContext(this.teams.get(teamId));
        this.teams.delete(teamId);
        this.currentState.onTeamOrderChange();
        return true;
    }

    reorderTeam(newTeamsOrder) {
        if (!this.teams.reorder(newTeamsOrder)) return false;
        this.currentState.onTeamOrderChange();
        return true;
    }

    updateLocation(teamId, coords) {
        return this._performOnTeam("updateLocation", teamId, coords);
    }

    //// Playing state

    eliminate(teamId) {
        return this._performOnTeam("eliminate", teamId);
    }

    revive(teamId) {
        return this._performOnTeam("revive", teamId);
    }
    
    addHandicap(teamId) {
        return this._performOnTeam("addHandicap", teamId);
    }
    
    clearHandicap(teamId) {
        return this._performOnTeam("clearHandicap", teamId);
    }

    scan(teamId, coords) {
        return this._performOnTeam("updateLocation", teamId, coords) && this._performOnTeam("scan", teamId);
    }

    capture(teamId, captureCode) {
        return this._performOnTeam("capture", teamId, captureCode);
    }
}

export const gameManager = new GameManager();
