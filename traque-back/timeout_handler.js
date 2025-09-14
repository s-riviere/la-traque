import game from "./game.js";

class TimeoutManager {
    constructor() {
        this.timeouts = new Map();
    }

    has(key) {
        return this.timeouts.has(key);
    }

    set(key, callback, delay) {
        const newCallback = () => {
            this.timeouts.delete(key);
            callback();
        }

        if (this.timeouts.has(key)) clearTimeout(this.timeouts.get(key));
        this.timeouts.set(key, setTimeout(newCallback, delay));
    }

    clear(key) {
        if (this.timeouts.has(key)) {
            clearTimeout(this.timeouts.get(key));
            this.timeouts.delete(key);
        }
    }

    clearAll() {
        this.timeouts.forEach(timeout => clearTimeout(timeout));
        this.timeouts = new Map();
    }
}

export const sendPositionTimeouts = {
    timeoutManager: new TimeoutManager(),
    delay: 10, // Minutes

    has(teamID) {
        return this.timeoutManager.has(teamID);
    },

    set(teamID) {
        const callback = () => {
            game.sendLocation(teamID);
            this.set(teamID);
        }

        this.timeoutManager.set(teamID, callback, this.delay * 60 * 1000);
    },

    clear(teamID) {
        this.timeoutManager.clear(teamID);
    },

    clearAll() {
        this.timeoutManager.clearAll();
    },

    setDelay(delay) {
        this.delay = delay;
    }
}

export const outOfZoneTimeouts = {
    timeoutManager: new TimeoutManager(),
    delay: 10, // Minutes

    has(teamID) {
        return this.timeoutManager.has(teamID);
    },

    set(teamID) {
        const callback = () => {
            game.handicapTeam(teamID);
        }

        this.timeoutManager.set(teamID, callback, this.delay * 60 * 1000);
    },

    clear(teamID) {
        this.timeoutManager.clear(teamID);
    },

    clearAll() {
        this.timeoutManager.clearAll();
    },

    setDelay(delay) {
        this.delay = delay;
    }
}
