import { DefaultTeam } from "#core/states/teams/default_team.js";

export class DefaultState {
    static name = "default";

    get name () {
        return this.constructor.name;
    }

    constructor(teams, zoneManager) {
        this.teams = teams;
        this.zoneManager = zoneManager;
    }
    

    // --------------- LIFE CYCLE --------------- //

    initTeam(team, settings) {
        team.state = new DefaultTeam(team).init(settings);
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

    updateLocation(team, coords) {
        team.updateLocation(coords);
        return true;
    }
    

    // --------------- OTHER --------------- //

    canGameStart() {
        return this.teams.size >= 3;
    }
}
