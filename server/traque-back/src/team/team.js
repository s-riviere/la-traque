export class Team {
    constructor(id, teamName) {
        // Identity
        this.id = id;
        this.name = teamName;
        // Location
        this.location = { coords: null, timestamp: null };
        // Context
        this.context = {};
    }

    updateLocation(coords) {
        this.location = { coords: coords, timestamp: Date.now()}
    }

    equals(team) {
        return this.id === team.id;
    }
}
