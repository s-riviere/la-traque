import { TeamMapper } from "./team_mapper.js";
import { PlayingState } from "@/states/playing_state.js";
import zoneManager from "@/core/zone_manager.js";

export class PlayingTeamMapper extends TeamMapper {
    mapForTeam(team) {
        return {
            ...super.mapForTeam(team),
            state: PlayingState.stateName,
            context: {
                // Team
                captureCode: team.context.captureCode,
                scanLocation: team.context.scanLocation,
                // Booleans
                isEliminated: team.context.isEliminated,
                isOutOfZone: team.context.isOutOfZone,
                hasHandicap: team.context.hasHandicap,
                // Timeouts
                scanRemainingTime: team.context.scanTimeout.remainingTime,
                outOfZoneRemainingTime: team.context.outOfZoneTimeout.remainingTime,
                // Target
                targetName: team.context.target?.name,
                targetScanLocation: team.context.targetScanLocation,
                targetHasHandicap: team.context.hunter?.context.hasHandicap,
                // Zone
                zoneType: zoneManager.settings.zoneType,
                zoneCurrent: zoneManager.getCurrentZone(),
                zoneNext: zoneManager.getNextZone(),
                zoneRemainingTime: zoneManager.currentZone?.endDate ? Math.max(0, zoneManager.currentZone.endDate - Date.now()) : null
            }
        };
    }

    mapForAdmin(team) {
        return {
            ...super.mapForAdmin(team),
            state: PlayingState.stateName,
            context: {
                // Team
                captureCode: team.context.captureCode,
                scanLocation: team.context.scanLocation,
                // Booleans
                isEliminated: team.context.isEliminated,
                isOutOfZone: team.context.isOutOfZone,
                hasHandicap: team.context.hasHandicap,
                // Timeouts
                scanRemainingTime: team.context.scanTimeout.remainingTime,
                outOfZoneRemainingTime: team.context.outOfZoneTimeout.remainingTime,
                // Target and hunter
                hunterName: team.context.hunter.name,
                targetName: team.context.target.name,
                targetScanLocation: team.context.targetScanLocation,
            }
        };
    }
}
