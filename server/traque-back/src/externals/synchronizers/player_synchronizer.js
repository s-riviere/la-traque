import { GAME_MANAGER_EVENTS, PLAYER_SYNCHRONIZER_EVENTS } from "@/config/events.js";
import { PlayerMapper } from "@/externals/mappers/player_mapper.js";
import { StateTracker } from "@/util/state_tracker.js";

export class PlayerSynchronizer {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.teamsStateTracker = new Map();
    }
    
    init(io) {
        this.gameManager.on(GAME_MANAGER_EVENTS.INIT_PLAYER, (socketId, teamId) => {
            const { dto } = this._getSyncDtoOfTeam(this.gameManager.teams.get(teamId));
            io.to(socketId).emit(PLAYER_SYNCHRONIZER_EVENTS.UPDATE_FULL, dto);
        });

        this.gameManager.on(GAME_MANAGER_EVENTS.UPDATE_GAME, () => {
            this.gameManager.teams.forEach((team, teamId) => {
                const { dto, hasChanged } = this._getSyncDtoOfTeam(team);
                if (hasChanged) io.to(teamId).emit(PLAYER_SYNCHRONIZER_EVENTS.UPDATE_FULL, dto);
            })
        });

        this.gameManager.on(GAME_MANAGER_EVENTS.DELETE_TEAM, (teamId) => {
            this.teamsStateTracker.delete(teamId);
            io.to(teamId).emit(PLAYER_SYNCHRONIZER_EVENTS.LOGOUT);
        });

        return this;
    }

    _getSyncDtoOfTeam(team) {
        if (!this.teamsStateTracker.has(team.id)) {
            const mapper = new PlayerMapper(this.gameManager.state, team);
            this.teamsStateTracker.set(team.id, new StateTracker(mapper));
        }
        return this.teamsStateTracker.get(team.id).getSyncDto();
    }
}
