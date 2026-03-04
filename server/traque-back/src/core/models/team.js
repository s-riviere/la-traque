import { CAPTURE_CODE_LENGTH, TEAM_ID_LENGTH } from "#config/game.js";
import { randint } from "#util/random.js";

export class Team {
    constructor(id, teamName) {
        this.id = id;
        this.name = teamName;
        this.location = { coords: null, timestamp: null };
        this.state = null;
    }

    static isTeamNameValid = (teamName) => {
        return typeof teamName === 'string' && teamName.length > 0;
    }
    
    static getNewTeamId = () => {
        return randint(10 ** TEAM_ID_LENGTH).toString().padStart(TEAM_ID_LENGTH, '0');
    }

    static getNewCaptureCode = () => {
        return randint(10 ** CAPTURE_CODE_LENGTH).toString().padStart(CAPTURE_CODE_LENGTH, '0');
    }

    equals(team) {
        return this.id === team.id;
    }
    
    updateLocation(coords) {
        this.location = { coords: coords, timestamp: Date.now() };
        return true;
    }
}
