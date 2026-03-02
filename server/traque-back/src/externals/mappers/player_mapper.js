import { DefaultState, PlacementState, PlayingState, FinishedState } from "@/core/states/game/index.js";

const TEAM_STATE_MAP = {
    [DefaultState.name]: (_team, _gameState) => ({}),

    [PlacementState.name]: (team, _gameState) => ({
        placementZone: team.state.placementZone?.polygon ?? null,
        isInPlacementZone: team.state.placementZone?.isInZone(team.location) ?? true,
        playingZone: team.state.zoneManager.firstZonePolygon,
    }),

    [PlayingState.name]: (team, gameState) => ({
        // Team
        captureCode: team.state.captureCode,
        scanLocation: team.state.scanLocation,
        // Booleans
        isEliminated: team.state.isEliminated,
        isOutOfZone: team.state.isOutOfZone,
        hasHandicap: team.state.hasHandicap,
        // Scheduled taks
        scanDate: team.state.scheduledScan.dateOfExecution,
        handicapDate: team.state.scheduledHandicap.dateOfExecution,
        // Target
        targetName: gameState.getTarget(team).name,
        targetHasHandicap: gameState.getTarget(team).state.hasHandicap,
        targetScanLocation: team.state.targetScanLocation,
        // Game zone
        currentZone: team.state.zoneManager.currentZonePolygon,
        nextZone: team.state.zoneManager.nextZonePolygon,
        zoneTransitionDate: team.state.zoneManager.dateOfZoneTransition
    }),

    [FinishedState.name]: (_team, _gameState) => ({}),
};

export class PlayerMapper {
    constructor(gameState, team) {
        this.gameState = gameState;
        this.team = team;
    }

    map() {
        return {
            id: this.team.id,
            name: this.team.name,
            stateName: this.gameState.name,
            state: TEAM_STATE_MAP[this.gameState.name](this.team, this.gameState)
        };
    }

    hash(dto) {
        return JSON.stringify(dto);
    }
};
