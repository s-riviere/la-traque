import { Team } from "#core/models/team.js";
import { ScheduledTask } from "#util/scheduler.js";
import { RESTART_TIMERS } from "#config/game.js";

export class PlayingTeam {
    constructor(team, zoneManager) {
        this.team = team;
        this.zoneManager = zoneManager;
    }
    

    // --------------- LIFE CYCLE --------------- //

    init(settings) {
        // Team
        this.scanLocation = this.team.location;
        this.captureCode = Team.getNewCaptureCode();
        // Booleans
        this.isEliminated = false;
        this.isOutOfZone = false;
        this.hasHandicap = false;
        // Scheduled taks
        this.scheduledScan = new ScheduledTask(() => this.scan(), settings.scanDelay).start();
        this.scheduledHandicap = new ScheduledTask(() => this.addHandicap(), settings.outOfZoneDelay);
        // Target
        this.targetScanLocation = { coords: null, timesptamp: null };
        return this;
    }

    clear() {
        this.scheduledScan.interrupt();
        this.scheduledHandicap.interrupt();
    }
    

    // --------------- ACTIONS --------------- //

    applySettings(settings) {
        this.scheduledScan.setDelay(settings.scanDelay, RESTART_TIMERS);
        this.scheduledHandicap.setDelay(settings.outOfZoneDelay, RESTART_TIMERS);
        return true;
    }
    
    eliminate() {
        if (this.isEliminated) return false;
        this.clear();
        this.isEliminated = true;
        return true;
    }

    revive() {
        if (!this.isEliminated) return false;
        this.init();
        return true;
    }

    addHandicap() {
        if (this.hasHandicap) return false;
        this.hasHandicap = true;
        this.scheduledScan.interrupt();
        return true;
    }

    clearHandicap() {
        if (!this.hasHandicap) return false;
        this.hasHandicap = false;
        this.scheduledScan.start();
        return true;
    }

    scan(target) {
        if (this.hasHandicap || this.isEliminated) return false;
        this.scanLocation = this.team.location;
        this.targetScanLocation = target.state.scanLocation;
        this.scheduledScan.start();
        return true;
    }

    capture(target, captureCode) {
        if (this.hasHandicap || this.isEliminated) return false;
        if (captureCode != target.state.captureCode) return false;
        target.state.eliminate();
        return true;
    }

    updateLocation() {
        const isOutOfZone = !this.zoneManager.isInZone(this.team.location);
        // Exit zone case 
        if (isOutOfZone && !this.isOutOfZone) {
            this.isOutOfZone = true;
            this.scheduledHandicap.start();
        // Enter zone case 
        } else if (!isOutOfZone && this.isOutOfZone) {
            this.isOutOfZone = false;
            this.scheduledHandicap.interrupt();
            this.clearHandicap();
        }
        return true;
    }
}
