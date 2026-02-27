import { TeamMapper } from "./team_mapper.js";
import { PlacementState } from "@/states/placement_state.js";

export class PlacementTeamMapper extends TeamMapper {
    mapForTeam(team) {
        return {
            ...super.mapForTeam(team),
            state: PlacementState.stateName,
            context: {
                placementZone: team.context.placementZone,
                isInPlacementZone: team.context.isInPlacementZone,
            }
        };
    }

    mapForAdmin(team) {
        return {
            ...super.mapForAdmin(team),
            state: PlacementState.stateName,
            context: {
                placementZone: team.context.placementZone,
                isInPlacementZone: team.context.isInPlacementZone,
            }
        };
    }
}
