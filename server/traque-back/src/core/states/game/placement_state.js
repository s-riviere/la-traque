import { PlacementTeam } from "@/core/states/teams/placement_team.js";

export class PlacementState {
    constructor(teams, zoneManager) {
        this.teams = teams;
        this.zoneManager = zoneManager;
    }

    static get name () {
        return "placement";
    }
    

    // --------------- LIFE CYCLE --------------- //

    initTeam(team, settings) {
        team.state = new PlacementTeam(team).init(settings);
    }

    enter(settings) {
        this.teams.forEach(team => this.initTeam(team, settings));
    }

    clearTeam(_team) {}

    exit() {
        this.teams.forEach(team => this.clearTeam(team));
    }
    

    // --------------- ACTIONS --------------- //

    applySettings(settings) {
        this.teams.forEach(team => team.state.applySettings(settings));
        return true;
    }

    updateLocation(team, coords) {
        team.updateLocation(coords);
        return true;
    }
}
