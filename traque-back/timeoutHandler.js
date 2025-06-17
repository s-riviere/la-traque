import game from "./game.js";

export default {
    teams: [],

    setSendPositionTimeout(teamID, deadline) {
        const foundTeam = this.teams.find(t => t.teamID === teamID);
        if (!foundTeam) {
            this.teams.push({teamID: teamID, timeoutID: setTimeout(() => game.sendLocation(teamID), deadline - Date.now())});
        } else {
            clearTimeout(foundTeam.timeoutID);
            foundTeam.timeoutID = setTimeout(() => game.sendLocation(teamID), deadline - Date.now());
        }
    },

    endSendPositionTimeout(teamID) {
        const foundTeam = this.teams.find(t => t.teamID === teamID);
        if (foundTeam) {
            clearTimeout(foundTeam.timeoutID);
            this.teams = this.teams.filter(t => t.teamID !== teamID);
        }
    },

    endAllSendPositionTimeout() {
        for (const team of this.teams) {
            clearTimeout(team.timeoutID);
        }
        this.teams = [];
    }
}
