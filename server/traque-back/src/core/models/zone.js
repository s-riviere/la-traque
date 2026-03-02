import * as turf from '@turf/turf';

export class Zone {
    constructor(turfPolygon) {
        this._turfPolygon = turfPolygon;
    }

    get polygon() {
        // Return a [latitude, longitude] list
        return this._turfPolygon.geometry.coordinates[0].slice(0, -1);
    }

    isInZone(location) {
        // location : [latitude, longitude]
        return turf.booleanPointInPolygon(turf.point(location), this._turfPolygon);
    }

    equals(zone) {
        return turf.booleanEqual(this._turfPolygon, zone._turfPolygon);
    }
};

export class ZoneWithDuration extends Zone {
    constructor(turfPolygon, duration) {
        super(turfPolygon);
        this.duration = duration;
    }
};
