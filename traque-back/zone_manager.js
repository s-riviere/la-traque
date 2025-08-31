import { playersBroadcast } from './team_socket.js';
import { secureAdminBroadcast } from './admin_socket.js';


/* -------------------------------- Useful functions and constants -------------------------------- */

const EARTH_RADIUS = 6_371_000; // Radius of the earth in m

function haversine_distance({ lat: lat1, lng: lon1 }, { lat: lat2, lng: lon2 }) {
    const degToRad = (deg) => deg * (Math.PI / 180);
    const dLat = degToRad(lat2 - lat1);
    const dLon = degToRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return c * EARTH_RADIUS;
}

function latlngEqual(latlng1, latlng2, epsilon = 1e-9) {
    return Math.abs(latlng1.lat - latlng2.lat) < epsilon && Math.abs(latlng1.lng - latlng2.lng) < epsilon;
}


/* -------------------------------- Polygon zones -------------------------------- */

const defaultPolygonSettings = [];

function polygonZone(points, duration) {
    return {
        points: points,
        duration: duration,

        isInZone(location) {
            const {lat: x, lng: y} = location;
            let inside = false;

            for (let i = 0, j = this.points.length - 1; i < this.points.length; j = i++) {
                const {lat: xi, lng: yi} = this.points[i];
                const {lat: xj, lng: yj} = this.points[j];

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
    const zones = [];

    for (const { polygon, duration } of settings.slice().reverse()) {
        const length = zones.length;

        if (length == 0) {
            zones.push(polygonZone(
                polygon,
                duration
            ));
        } else {
            zones.push(polygonZone(
                mergePolygons(zones[length-1].points, polygon),
                duration
            ));
        }
    }

    return zones.slice().reverse();
}


/* -------------------------------- Circle zones -------------------------------- */

const defaultCircleSettings = { min: null, max: null, reductionCount: 4, duration: 1 };

function circleZone(center, radius, duration) {
    return {
        center: center,
        radius: radius,
        duration: duration,

        isInZone(location) {
            return haversine_distance(center, location) < this.radius;
        }
    }
}

function circleSettingsToZones(settings) {
    const {min, max, reductionCount, duration} = settings;
    if (haversine_distance(max.center, min.center) > max.radius - min.radius) {
        return null;
    }
    const zones = [circleZone(max.center, max.radius, duration)];
    const radiusReductionLength = (max.radius - min.radius) / reductionCount;
    let center = max.center;
    let radius = max.radius;
    for (let i = 1; i < reductionCount; i++) {
        radius -= radiusReductionLength;
        let new_center = null;
        while (!new_center || haversine_distance(new_center, min.center) > radius - min.radius) {
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


/* -------------------------------- Zone manager -------------------------------- */

export default {
    isRunning: false,
    zones: [], // A zone has to be connected space that doesn't contain an earth pole
    currentZone: { id: 0, timeoutId: null, endDate: null },
    zoneType: "polygon",
    settings: defaultPolygonSettings,
    settingsToZones: polygonSettingsToZones,

    start() {
        this.isRunning = true;
        this.currentZone.id = -1;
        this.goNextZone();
    },

    stop() {
        this.isRunning = false;
        clearTimeout(this.currentZone.timeoutId);
    },

    goNextZone() {
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
        return this.zones[this.currentZone.id];
    },

    getNextZone() {
        if (this.currentZone.id + 1 < this.zones.length) {
            return this.zones[this.currentZone.id + 1];
        } else {
            return this.zones[this.currentZone.id];
        }
    },

    isInZone(location) {
        if (this.zones.length == 0) {
            return true;
        } else {
            return this.getCurrentZone().isInZone(location);
        }
    },

    changeSettings(settings) {
        const zones = this.settingsToZones(settings);
        if (!zones) return false;
        this.zones = zones;
        this.settings = settings;
        this.zoneBroadcast();
        return true;
    },

    changeZoneType(type) {
        if (this.zoneType == type) return;
        if (type == "circle") {
            this.zoneType = "circle";
            this.settings = defaultCircleSettings;
            this.settingsToZones = circleSettingsToZones;
        } else if (type == "polygon") {
            this.zoneType = "polygon";
            this.settings = defaultPolygonSettings;
            this.settingsToZones = polygonSettingsToZones;
        }
    },
    
    zoneBroadcast() {
        const zone = {
            begin: this.getCurrentZone(),
            end: this.getNextZone(),
            endDate:this.currentZone.endDate,
        };
        playersBroadcast("current_zone", zone);
        secureAdminBroadcast("current_zone", zone);
    },
}
