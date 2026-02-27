export class TimeoutManager {
    constructor(callback, delay, set = false) {
        this.callback = callback;
        this.delay = delay;
        this.id = null;
        this.date = null;
        if (set) this.set();
    }

    get remainingTime() {
        if (!this.id) return null;
        return Math.max(0, this.date - Date.now());
    }

    set() {
        if (this.id) clearTimeout(this.id);
        this.id = setTimeout(this.callback, this.delay);
        this.date = Date.now() + this.delay;
    }

    clear() {
        if (this.id) clearTimeout(this.id);
        this.id = null;
        this.date = null;
    }
}
