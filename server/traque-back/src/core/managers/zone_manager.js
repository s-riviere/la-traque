import { Scheduler } from "@/util/scheduler.js";
import { settingsToZoneList } from "@/core/factories/game_zone_factory.js";

export class ZoneManager {
    constructor() {
        this._zones = [];
        this._currentZoneId = null;
        this._scheduledZoneTransition = new Scheduler();
    }


    get firstZonePolygon() {
        return this._zones[0]?.polygon ?? null;
    }

    get currentZonePolygon() {
        return this._currentZone?.polygon ?? null;
    }

    get nextZonePolygon() {
        if (!this._isActive) return null;
        return this._zones[this._currentZoneId + 1]?.polygon ?? null;
    }

    get dateOfZoneTransition() {
        return this._scheduledZoneTransition.dateOfExecution;
    }

    get timeToZoneTransition() {
        return this._scheduledZoneTransition.timeToExecution;
    }

    start() {
        this._jumpToNextZone();
    }

    stop() {
        this._currentZoneId = null;
        this._scheduledZoneTransition.interrupt();
    }

    isInZone(location) {
        return this._isZonesEmpty || this._currentZone?.isInZone(location);
    }

    updateZones(settings) {
        this._zones = settingsToZoneList(settings);
        if (this._isActive) {
            this.stop();
            this.start();
        }
    }


    get _currentZone() {
        if (!this._isActive) return null;
        return this._zones[this._currentZoneId].polygon;
    }

    get _isZonesEmpty() {
        return this._zones.length === 0;
    }

    get _isActive() {
        return this._currentZoneId !== null;
    }

    _jumpToNextZone() {
        if (this._isZonesEmpty) return;
        this._currentZoneId = this._isActive ? this._currentZoneId + 1 : 0;
        if (this._currentZoneId + 1 < this._zones.length) this._scheduledZoneTransition.start(() => this._jumpToNextZone(), this._currentZone.duration);
    }
}
