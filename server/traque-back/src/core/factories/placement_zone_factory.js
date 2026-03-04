import * as turf from '@turf/turf';
import { Zone } from '#core/models/zone.js';
import { TURF_CIRCLE_STEPS, TURF_DISTANCE_UNIT } from '#config/zone.js';

export const settingsToZone = (settings) => {
    if (!settings) return null;
    const { center, radius } = settings;
    return new Zone(turf.circle(turf.point(center), radius, { steps: TURF_CIRCLE_STEPS, units: TURF_DISTANCE_UNIT }));
};
