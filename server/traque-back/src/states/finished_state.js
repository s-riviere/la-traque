import { GameState } from "@/states/game_state.js";
import { FinishedTeamMapper } from "@/team/mapper/finished_team_mapper.js";

export class FinishedState extends GameState {
    constructor(manager) {
        super(manager, new FinishedTeamMapper());
    }

    static get stateName () {
        return "finished";
    }

    // State functions

    updateLocation(team, coords) {
        team.updateLocation(coords);
        return true;
    }
}
