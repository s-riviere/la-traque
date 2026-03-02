export class Scheduler {
    constructor() {
        this._id = null;
        this._date = null;
    }

    get isActive() {
        return this._id !== null;
    }

    get dateOfExecution() {
       return this._date;
    }

    get timeToExecution() {
        return this.isActive ? Math.max(0, this._date - Date.now()) : null;
    }

    start(callback, delay) {
        this.interrupt();
        this._id = setTimeout(() => { this._clean(); callback(); }, delay);
        this._date = Date.now() + delay;
        return this;
    }

    interrupt() {
        if (!this.isActive) return;
        clearTimeout(this._id);
        this._clean();
    }

    _clean() {
        this._id = null;
        this._date = null;
    }
}

export class ScheduledTask extends Scheduler {
    constructor(callback, delay) {
        super();
        this._callback = callback;
        this._delay = delay;
    }

    start() {
        return super.start(this._callback, this._delay);
    }

    setDelay(delay, restart = false) {
        this._delay = delay;
        if (restart && this.isActive) {
            this.interrupt();
            this.start();
        }
    }
}
