import { settingsToZone } from "#core/factories/placement_zone_factory.js";

export class PlacementTeam {
    constructor(team) {
        this.team = team;
    }
    

    // --------------- LIFE CYCLE --------------- //

    init(settings) {
        this.placementZone = settingsToZone(settings.placementZones[this.team.id]);
        return this;
    }

    clear() {}
    

    // --------------- ACTIONS --------------- //

    applySettings(settings) {
        this.placementZone = settingsToZone(settings.placementZones[this.team.id]);
        return true;
    }
}
