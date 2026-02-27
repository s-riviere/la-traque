import { TeamMapper } from "./team_mapper.js";
import { FinishedState } from "@/states/finished_state.js";

export class FinishedTeamMapper extends TeamMapper {
    mapForTeam(team) {
        return {
            ...super.mapForTeam(team),
            state: FinishedState.stateName,
            context: {}
        };
    }

    mapForAdmin(team) {
        return {
            ...super.mapForAdmin(team),
            state: FinishedState.stateName,
            context: {}
        };
    }
}
