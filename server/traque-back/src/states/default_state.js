import { GameState } from "@/states/game_state.js";
import { DefaultTeamMapper } from "@/team/mapper/default_team_mapper.js";

export class DefaultState extends GameState {
    constructor(manager) {
        super(manager, new DefaultTeamMapper());
    }

    static get stateName () {
        return "default";
    }

    // State functions

    updateLocation(team, coords) {
        team.updateLocation(coords);
        return true;
    }
}
