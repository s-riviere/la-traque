import { TeamMapper } from "./team_mapper.js";
import { DefaultState } from "@/states/default_state.js";

export class DefaultTeamMapper extends TeamMapper {
    mapForTeam(team) {
        return {
            ...super.mapForTeam(team),
            state: DefaultState.stateName,
            context: {}
        };
    }

    mapForAdmin(team) {
        return {
            ...super.mapForAdmin(team),
            state: DefaultState.stateName,
            context: {}
        };
    }
}
