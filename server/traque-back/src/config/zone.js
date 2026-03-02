export const ZONE_TYPES = {
    CIRCLE: "circle",
    POLYGON: "polygon"
}

export const DEFAULT_ZONES_SETTINGS = {
    CIRCLE: { type: ZONE_TYPES.CIRCLE, min: null, max: null, reductionCount: 5, duration: 20 * 60 * 1000 },  
    POLYGON: { type: ZONE_TYPES.POLYGON, polygons: [] },  
};

export const TURF_DISTANCE_UNIT = 'meters';
export const TURF_CIRCLE_STEPS = 32;
export const TURF_BUFFER_SIZE = 1;
