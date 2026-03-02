import { DefaultTeam } from "@/core/states/teams/default_team.js";

export class DefaultState {
    constructor(teams, zoneManager) {
        this.teams = teams;
        this.zoneManager = zoneManager;
    }

    static get name () {
        return "default";
    }
    

    // --------------- LIFE CYCLE --------------- //

    initTeam(team, settings) {
        team.state = new DefaultTeam(team).init(settings);
    }

    enter(settings) {
        this.teams.forEach(team => this.initTeam(team, settings));
    }

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
