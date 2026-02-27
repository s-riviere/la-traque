export class GameState {
    constructor(manager, teamMapper) {
        this.manager = manager;
        this.teamMapper = teamMapper;
    }

    // Life cycle

    initTeamContext(_team) {}

    enter() {
        this.manager.teams.forEach(team => this.initTeamContext(team));
    }

    clearTeamContext(_team) {}

    exit() {
        this.manager.teams.forEach(team => this.clearTeamContext(team));
    }


    // Hooks

    onTeamOrderChange() {}


    // Mappers

    getTeamMapForTeam(team) {
        return this.teamMapper.mapForTeam(team);
    }

    getTeamMapForAdmin(team) {
        return this.teamMapper.mapForAdmin(team);
    }
}
