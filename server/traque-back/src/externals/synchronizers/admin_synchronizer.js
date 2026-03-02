import { AdminMapper } from "@/externals/mappers/admin_mapper.js";
import { StateTracker } from "@/util/state_tracker.js";
import { GAME_MANAGER_EVENTS, ADMIN_SYNCHRONIZER_EVENTS } from "@/config/events.js";

export class AdminSynchronizer {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.gameStateTracker = new StateTracker(new AdminMapper(this.gameManager));
    }
        
    init(io) {
        this.gameManager.on(GAME_MANAGER_EVENTS.INIT_ADMIN, (socketId) => {
            const { dto } = this.gameStateTracker.getSyncDto();
            io.to(socketId).emit(ADMIN_SYNCHRONIZER_EVENTS.UPDATE_FULL, dto);
        });

        this.gameManager.on(GAME_MANAGER_EVENTS.UPDATE_GAME, () => {
            const { dto, hasChanged } = this.gameStateTracker.getSyncDto();
            if (hasChanged) io.emit(ADMIN_SYNCHRONIZER_EVENTS.UPDATE_FULL, dto);
        });

        return this;
    }
}
