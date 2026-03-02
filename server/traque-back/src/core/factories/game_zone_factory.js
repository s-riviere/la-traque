import * as turf from '@turf/turf';
import { ZoneWithDuration } from '@/core/models/zone.js';
import { TURF_BUFFER_SIZE, TURF_CIRCLE_STEPS, TURF_DISTANCE_UNIT, ZONE_TYPES } from '@/config/zone.js';

export const settingsToZoneList = (settings) => {
    if (!settings) return [];
    
    switch (settings.type) {
        case ZONE_TYPES.CIRCLE:
            return circleSettingsToZoneList(settings);
        case ZONE_TYPES.POLYGON:
            return polygonSettingsToZoneList(settings);
        default:
            return [];
    }
};

const circleSettingsToZoneList = ({ min, max, reductionCount, duration }) => {
    if (min == null || max == null) return [];

    const zones = [];
    const add = (center, radius) => zones.push(new ZoneWithDuration(turf.circle(turf.point(center), radius, { steps: TURF_CIRCLE_STEPS, units: TURF_DISTANCE_UNIT }), duration));

    // Add max zone
    add(turf.point(max.center), max.radius);

    // Add intermediates zones
    const radiusReductionLength = (max.radius - min.radius) / reductionCount;
    let center = turf.point(max.center);
    let radius = max.radius;
    for (let i = 1; i < reductionCount; i++) {
        radius -= radiusReductionLength;
        
        let tempCenter;
        do {
            const distance = radius * Math.sqrt(Math.random());
            const bearing = Math.random() * 360;
            tempCenter = turf.destination(center, distance, bearing, { units: 'meters' });
        } while (turf.distance(tempCenter, turf.point(min.center)) > radius - min.radius);
        center = tempCenter;

        add(center, radius);
    }

    // Add min zone
    add(turf.point(min.center), min.radius);

    return zones;
};

const polygonSettingsToZoneList = ({ polygons }) => {
    const polygonsCount = polygons.length;
    if (polygonsCount === 0) return [];

    // Convert polygons to turf polygon with a buffer
    const bufferedPolygons = polygons.map(item => ({
        polygon: turf.buffer(turf.polygon([[...item.polygon, item.polygon[0]]]), TURF_BUFFER_SIZE, { units: TURF_DISTANCE_UNIT }),
        duration: item.duration
    }));

    const inversedZones = [bufferedPolygons[polygonsCount-1]];

    for (let i = polygonsCount-2; 0 <= i; i--) {
        const { polygon, duration } = bufferedPolygons[i];
        const union = turf.union(turf.featureCollection([inversedZones[inversedZones.length-1].polygon, polygon]));
        if (union && union.geometry.type === 'Polygon') inversedZones.push(new ZoneWithDuration(union, duration));
    }

    return [...inversedZones].reverse();
};
