import { PlacementTeam } from "#core/states/teams/placement_team.js";

export class PlacementState {
    static name = "placement";

    get name () {
        return this.constructor.name;
    }

    constructor(teams, zoneManager) {
        this.teams = teams;
        this.zoneManager = zoneManager;
    }
    

    // --------------- LIFE CYCLE --------------- //

    initTeam(team, settings) {
        team.state = new PlacementTeam(team).init(settings);
    }

    enter(settings) {
        this.teams.forEach(team => this.initTeam(team, settings));
    }

    // eslint-disable-next-line no-unused-vars
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
