import { PlayingTeam } from "@/core/states/teams/playing_team.js";

export class PlayingState {
    constructor(teams, zoneManager) {
        this.teams = teams;
        this.zoneManager = zoneManager;
    }

    static get name () {
        return "playing";
    }
    

    // --------------- LIFE CYCLE --------------- //

    initTeam(team, settings) {
        team.state = new PlayingTeam(team, this.zoneManager).init(settings);
    }

    enter(settings) {
        this.teams.forEach(team => this.initTeam(team, settings));
        this.zoneManager.start();
    }

    clearTeam(team) {
        team.state.clear();
    }

    exit() {
        this.teams.forEach(team => this.clearTeam(team));
        this.zoneManager.stop();
    }
    

    // --------------- ACTIONS --------------- //

    applySettings(settings) {
        this.teams.forEach(team => team.state.applySettings(settings));
        return true;
    }

    eliminate(team) {
        return team.state.eliminate();
    }

    revive(team) {
        return team.state.revive();
    }

    addHandicap(team) {
        return team.state.addHandicap();
    }

    clearHandicap(team) {
        return team.state.clearHandicap();
    }

    scan(team) {
        return team.state.scan(this.getTarget(team));
    }

    capture(team, captureCode) {
        return team.state.capture(this.getTarget(team), captureCode);
    }

    updateLocation(team, coords) {
        team.updateLocation(coords);
        return team.state.updateIsInZone();
    }
    

    // --------------- OTHER --------------- //

    get _playingTeams() {
        return this.teams.order.filter(team => !team.state.isEliminated);
    }

    getHunter(team) {
        const length = this._playingTeams.length;
        const i = this.teams.order.indexOf(team.id);
        return this._playingTeams[(i+length-1) % length];
    }

    getTarget(team) {
        const length = this._playingTeams.length;
        const i = this.teams.order.indexOf(team.id);
        return this._playingTeams[(i+1) % length];
    }

    isGameOver() {
        return this._playingTeams.length <= 2;
    }
}
