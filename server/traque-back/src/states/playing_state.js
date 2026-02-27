import zoneManager from "@/core/zone_manager.js";
import { randint } from "@/util/util.js";
import { GameState } from "@/states/game_state.js";
import { FinishedState } from "./finished_state.js";
import { TimeoutManager } from "@/util/timeout_manager.js";
import { PlayingTeamMapper } from "@/team/mapper/playing_team_mapper.js";


const getNewCaptureCode = () => {
    const codeLength = 4;
    return randint(10 ** codeLength).toString().padStart(codeLength, '0');
};


export class PlayingState extends GameState {
    constructor(manager) {
        super(manager, new PlayingTeamMapper());
    }

    static get stateName () {
        return "playing";
    }
    
    // Life cycle

    initTeamContext(team) {
        team.context = {
            // Team
            scanLocation: team.location,
            captureCode: getNewCaptureCode(),
            // Booleans
            isEliminated: false,
            isOutOfZone: false,
            hasHandicap: false,
            // Timeouts
            scanTimeout: new TimeoutManager(() => this.scan(team.id), this.manager.settings.scanDelay, true),
            outOfZoneTimeout: new TimeoutManager(() => this.addHandicap(team.id), this.manager.settings.outOfZoneDelay, true),
            // Hunter and target
            hunter: null,
            target: null,
            targetScanLocation: { coords: null, timesptamp: null },
        };
        this.manager.emitTeamUpdate(team.id, team);
    }

    enter() {
        super.enter();
        this.onTeamOrderChange();
        zoneManager.start();
    }

    clearTeamContext(team) {
        team.context.scanTimeout.clear();
        team.context.outOfZoneTimeout.clear();
    }

    exit() {
        super.exit();
        zoneManager.stop();
    }


    // Hooks
    
    onTeamOrderChange() {
        const playingTeamsOrder = this.manager.teams.order.filter(team => !team.context.isEliminated);
        const length = playingTeamsOrder.length;
        playingTeamsOrder.forEach((team, i) => {
            const hunter = this.manager.teams.get(playingTeamsOrder[(i+length-1) % length]);
            const target = this.manager.teams.get(playingTeamsOrder[(i+1) % length]);
            let hasChanged = false;
            if (!team.context.hunter.equals(hunter)) {
                team.context.hunter = hunter;
                hasChanged = true;
            }
            if (!team.context.target.equals(target)) {
                team.context.target = target;
                team.context.targetScanLocation = target.context.location;
                hasChanged = true;
            }
            if (hasChanged) {
                this.manager.emitTeamUpdate(team.id, team);
            }
        });

        if (this.manager.teams.order.filter(team => !team.context.isEliminated).length <= 2) {
            this.manager.setState(FinishedState);
        }

        return true;
    }


    // State functions

    eliminate(team) {
        if (team.context.isEliminated) return false;

        this.clearTeamContext(team);
        team.context.isEliminated = true;
        this.onTeamOrderChange();

        return true;
    }

    revive(team) {
        if (!team.context.isEliminated) return false;

        this.initTeamContext(team);
        this.onTeamOrderChange();

        return true;
    }

    addHandicap(team) {
        if (team.context.hasHandicap) return false;

        team.context.hasHandicap = true;
        team.context.scanTimeout.clear();
        this.manager.emitTeamUpdate(team.id, team);

        return true;
    }

    clearHandicap(team) {
        if (!team.context.hasHandicap) return false;

        team.context.hasHandicap = false;
        team.context.scanTimeout.set();
        this.manager.emitTeamUpdate(team.id, team);

        return true;
    }

    scan(team) {
        if (team.context.hasHandicap || team.context.isEliminated) return false;

        team.context.scanLocation = team.location;
        team.context.targetScanLocation = team.context.target.context.scanLocation;
        team.context.scanTimeout.set();
        this.manager.emitTeamUpdate(team.id, team);

        return true;
    }

    capture(team, captureCode) {
        if (team.context.hasHandicap || team.context.isEliminated) return false;

        if (captureCode != team.context.target.context.captureCode) return false;
        this.eliminate(team.context.target);

        return true;
    }

    updateLocation(team, coords) {
        team.updateLocation(coords);

        const isOutOfZone = !zoneManager.isInZone(team.location);
        // Exit zone case 
        if (isOutOfZone && !team.context.isOutOfZone) {
            team.context.isOutOfZone = true;
            team.context.outOfZoneTimeout.set();
            this.manager.emitTeamUpdate(team.id, team);
        // Enter zone case 
        } else if (!isOutOfZone && team.context.isOutOfZone) {
            team.context.isOutOfZone = false;
            team.context.outOfZoneTimeout.clear();
            this.clearHandicap(team);
            this.manager.emitTeamUpdate(team.id, team);
        }

        return true;
    }
}
