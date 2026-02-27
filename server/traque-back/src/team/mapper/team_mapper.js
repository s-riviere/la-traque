import { GameState } from "@/states/game_state.js";

export class TeamMapper {
    mapForTeam(team) {
        return {
            id: team.id,
            name: team.name,
            state: GameState.stateName,
            context: {}
        };
    }

    mapForAdmin(team) {
        return {
            id: team.id,
            name: team.name,
            location: team.location,
            connectedPlayerCount: team.connectedPlayerCount,
            state: GameState.stateName,
            context: {}
        };
    }
}
