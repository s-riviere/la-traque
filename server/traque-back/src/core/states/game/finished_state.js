import { FinishedTeam } from "@/core/states/teams/finished_team.js";

export class FinishedState {
    constructor(teams, zoneManager) {
        this.teams = teams;
        this.zoneManager = zoneManager;
    }

    static get name () {
        return "finished";
    }
    

    // --------------- LIFE CYCLE --------------- //

    initTeam(team, settings) {
        team.state = new FinishedTeam(team).init(settings);
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
}
