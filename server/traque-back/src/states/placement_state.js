import { haversineDistance } from "@/util/util.js";
import { GameState } from "@/states/game_state.js";
import { PlacementTeamMapper } from "@/team/mapper/placement_team_mapper.js";

export class PlacementState extends GameState {
    constructor(manager) {
        super(manager, new PlacementTeamMapper());
    }

    static get stateName () {
        return "placement";
    }

    // Life cycle

    initTeamContext(team) {
        team.context = {
            placementZone: null,
            isInPlacementZone: true,
        };
        this.manager.emitTeamUpdate(team.id, team);
    }


    // State functions

    updateLocation(team, coords) {
        team.updateLocation(coords);

        team.context.isInPlacementZone = (
            team.context.placementZone ? haversineDistance(team.location, team.context.placementZone.center) < team.context.placementZone.radius : true
        );
        
        return true;
    }
}
