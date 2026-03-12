import { Team } from "#core/models/team.js";

export class TeamManager {
    constructor() {
        this._map = new Map();
        this.order = [];
    }


    // Read

    get size() {
        return this._map.size;
    }
    
    get(id) {
        return this._map.get(id);
    }

    has(id) {
        return this._map.has(id);
    }

    forEach(callback) {
        for (const id of this.order) {
            callback(this._map.get(id), id, this);
        }
    }


    // Write

    add(teamName) {
        if (!Team.isTeamNameValid(teamName)) return null;
        let id; do { id = Team.getNewTeamId(); } while (this.has(id));
        const team = new Team(id, teamName);
        if (!this.has(id)) this.order.push(id);
        this._map.set(id, team);
        return team;
    }

    delete(id) {
        if (!this._map.delete(id)) return false;
        this.order = this.order.filter(i => i !== id);
        return true;
    }

    clear() {
        this.order = [];
        this._map.clear();
    }

    reorder(newOrder) {
        const isValid = newOrder.length === this.size && new Set([...this.order, ...newOrder]).size === this.size;
        if (!isValid) return false;
        this.order = newOrder;
        return true;
    }
}
