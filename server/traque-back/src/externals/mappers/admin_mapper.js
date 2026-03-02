import { DefaultState, PlacementState, PlayingState, FinishedState } from "@/core/states/game/index.js";

const TEAM_STATE_MAP = {
    [DefaultState.name]: (_team, _gameState) => ({}),

    [PlacementState.name]: (team, _gameState) => ({
        placementZone: team.state.placementZone?.polygon ?? null,
        isInPlacementZone: team.state.placementZone?.isInZone(team.location) ?? true,
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
        // Target and hunter
        hunterName: gameState.getHunter(team).name,
        targetName: gameState.getTarget(team).name,
        targetScanLocation: team.state.targetScanLocation,
    }),

    [FinishedState.name]: (_team, _gameState) => ({}),
};


export class AdminMapper {
    constructor(gameManager) {
        this.gameManager = gameManager;
    }

    map() {
        const stateName = this.gameManager.state.name;

        const teamsDto = {};
        this.gameManager.teams.forEach((team, teamId) => {
            teamsDto[teamId] = {
                id: team.id,
                name: team.name,
                location: team.location,
                state: TEAM_STATE_MAP[stateName](team, this.gameManager.state)
            };
        });

        const zonesDto = {
            firstZone: this.gameManager.zoneManager.firstZonePolygon,
            currentZone: this.gameManager.zoneManager.currentZonePolygon,
            nextZone: this.gameManager.zoneManager.nextZonePolygon,
            zoneTransitionDate: this.gameManager.zoneManager.dateOfZoneTransition
        }

        return {
            stateName: stateName,
            teams: teamsDto,
            teamsOrder: this.gameManager.teams.order,
            zones: zonesDto,
            settings: this.gameManager.settings
        }
    }

    hash(dto) {
        return JSON.stringify(dto);
    }
};
