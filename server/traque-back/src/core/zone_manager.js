import { haversineDistance, EARTH_RADIUS } from "./util.js";


/* -------------------------------- Useful functions and constants -------------------------------- */

const ZONE_TYPES = {
    CIRCLE: "circle",
    POLYGON: "polygon"
}

function latlngEqual(latlng1, latlng2, epsilon = 1e-9) {
    return Math.abs(latlng1.lat - latlng2.lat) < epsilon && Math.abs(latlng1.lng - latlng2.lng) < epsilon;
}


/* -------------------------------- Circle zones -------------------------------- */

const defaultCircleSettings = {type: ZONE_TYPES.CIRCLE, min: null, max: null, reductionCount: 4, duration: 10}

function circleZone(center, radius, duration) {
    return {
        type: ZONE_TYPES.CIRCLE,
        center: center,
        radius: radius,
        duration: duration,

        isInZone(location) {
            return haversineDistance(center, location) < this.radius;
        }
    }
}

function circleSettingsToZones(settings) {
    const {min, max, reductionCount, duration} = settings;

    if (!min || !max) return [];
    if (haversineDistance(max.center, min.center) > max.radius - min.radius) return [];

    const zones = [circleZone(max.center, max.radius, duration)];
    const radiusReductionLength = (max.radius - min.radius) / reductionCount;
    let center = max.center;
    let radius = max.radius;

    for (let i = 1; i < reductionCount; i++) {
        radius -= radiusReductionLength;
        let new_center = null;
        while (!new_center || haversineDistance(new_center, min.center) > radius - min.radius) {
            const angle = Math.random() * 2 * Math.PI;
            const angularDistance = Math.sqrt(Math.random()) * radiusReductionLength / EARTH_RADIUS;
            const lat0Rad = center.lat * Math.PI / 180;
            const lon0Rad = center.lng * Math.PI / 180;
            const latRad = Math.asin(
                Math.sin(lat0Rad) * Math.cos(angularDistance) +
                Math.cos(lat0Rad) * Math.sin(angularDistance) * Math.cos(angle)
            );

            const lonRad = lon0Rad + Math.atan2(
                Math.sin(angle) * Math.sin(angularDistance) * Math.cos(lat0Rad),
                Math.cos(angularDistance) - Math.sin(lat0Rad) * Math.sin(latRad)
            );
            new_center = {lat: latRad * 180 / Math.PI, lng: lonRad * 180 / Math.PI};
        }
        center = new_center;
        zones.push(circleZone(center, radius, duration))
    }
    zones.push(circleZone(min.center, min.radius, 0));

    return zones;
}


/* -------------------------------- Polygon zones -------------------------------- */

const defaultPolygonSettings = {type: ZONE_TYPES.POLYGON, polygons: []}

function polygonZone(polygon, duration) {
    return {
        type: ZONE_TYPES.POLYGON,
        polygon: polygon,
        duration: duration,

        isInZone(location) {
            const {lat: x, lng: y} = location;
            let inside = false;

            for (let i = 0, j = this.polygon.length - 1; i < this.polygon.length; j = i++) {
                const {lat: xi, lng: yi} = this.polygon[i];
                const {lat: xj, lng: yj} = this.polygon[j];

                const intersects = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);

                if (intersects) inside = !inside;
            }

            return inside;
        }
    }
}

function mergePolygons(poly1, poly2) {
    // poly1 and poly2 are clockwise, not overlaping and touching polygons. If those two polygons were on a map, they would be
    // one against each other, and the merge would make a new clockwise polygon out of the outer border of the two polygons.
    // If it happens that poly1 and poly2 are not touching, poly1 would be returned untouched.
    // Basically because polygons are clockwise, the alogorithm starts from a point A in poly1 not shared by poly2, and
    // when a point is shared by poly1 and poly2, the algorithm continues in poly2, and so on until point A.

    const getPointIndex = (point, array) => {
        for (let i = 0; i < array.length; i++) {
            if (latlngEqual(array[i], point)) return i;
        }
        return -1;
    }

    // Find the index of the first point of poly1 that doesn't belong to merge (it exists)
    let i = 0;
    while (getPointIndex(poly1[i], poly2) != -1) i++;
    // Starting the merge from that point
    const merge = [poly1[i]];
    i = (i + 1) % poly1.length;
    let currentArray = poly1;
    let otherArray = poly2;
    while (!latlngEqual(currentArray[i], merge[0])) {
        const j = getPointIndex(currentArray[i], otherArray);
        if (j != -1) {
            [currentArray, otherArray] = [otherArray, currentArray];
            i = j;
        }
        merge.push(currentArray[i]);
        i = (i + 1) % currentArray.length;
    }
    return merge;
}

function polygonSettingsToZones(settings) {
    const {polygons} = settings;

    const zones = [];

    for (const { polygon, duration } of polygons.slice().reverse()) {
        const length = zones.length;

        if (length == 0) {
            zones.push(polygonZone(
                polygon,
                duration
            ));
        } else {
            zones.push(polygonZone(
                mergePolygons(zones[length-1].polygon, polygon),
                duration
            ));
        }
    }

    return zones.slice().reverse();
}


/* -------------------------------- Zone manager -------------------------------- */

export default {
    isRunning: false,
    zones: [], // A zone has to be connected space that doesn't contain an earth pole
    currentZone: null,
    settings: defaultPolygonSettings,

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.currentZone = { id: -1, timeoutId: null, endDate: null };
        this.goNextZone();
    },

    stop() {
        if (!this.isRunning) return;
        clearTimeout(this.currentZone.timeoutId);
        this.isRunning = false;
        this.currentZone = null;
    },

    goNextZone() {
        if (!this.isRunning) return;
        this.currentZone.id++;
        if (this.currentZone.id >= this.zones.length - 1) {
            this.currentZone.endDate = Date.now();
        } else {
            this.currentZone.timeoutId = setTimeout(() => this.goNextZone(), this.getCurrentZone().duration * 60 * 1000);
            this.currentZone.endDate = Date.now() + this.getCurrentZone().duration * 60 * 1000;
        }
        this.zoneBroadcast();
    },

    getCurrentZone() {
        if (!this.isRunning) return null;
        return this.zones[this.currentZone.id];
    },

    getNextZone() {
        if (!this.isRunning) return null;
        if (this.currentZone.id + 1 < this.zones.length) {
            return this.zones[this.currentZone.id + 1];
        } else {
            return this.zones[this.currentZone.id];
        }
    },

    isInZone(location) {
        if (!this.isRunning) return false;
        if (this.zones.length == 0) {
            return true;
        } else {
            return this.getCurrentZone().isInZone(location);
        }
    },

    changeSettings(settings) {
        switch (settings.type) {
            case ZONE_TYPES.CIRCLE:
                this.zones = circleSettingsToZones(settings);
                break;
            case ZONE_TYPES.POLYGON:
                this.zones = polygonSettingsToZones(settings);
                break;
            default:
                this.zones = [];
                break;
        }
        this.settings = settings;
        this.stop();
        this.start();
        this.zoneBroadcast();
    },
    
    zoneBroadcast() {
        if (!this.isRunning) return;
        const zone = {
            begin: this.getCurrentZone(),
            end: this.getNextZone(),
            endDate:this.currentZone.endDate,
        };
    },
}
