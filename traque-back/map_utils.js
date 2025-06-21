/**
 * Convert a angle from degree to radian
 * @param {Number} deg angle in degree
 * @returns angle in radian
 */
function degToRad(deg) {
    return deg * (Math.PI / 180);
}

/**
 * Compute the distance between two points givent their longitude and latitude 
 * @param {Object} pos1 The first position
 * @param {Object} pos2 The second position
 * @returns the distance between the two positions in meters
 * @see https://gist.github.com/miguelmota/10076960
 */
export function getDistanceFromLatLon({ lat: lat1, lng: lon1 }, { lat: lat2, lng: lon2 }) {
    var R = 6371; // Radius of the earth in km
    var dLat = degToRad(lat2 - lat1);
    var dLon = degToRad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d * 1000;
}

/**
 * Check if a GPS point is in a circle
 * @param {Object} position The position to check, an object with lat and lng fields
 * @param {Object} center The center of the circle, an object with lat and lng fields
 * @param {Number} radius The radius of the circle in meters
 * @returns 
 */
export function isInCircle(position, center, radius) {
    return getDistanceFromLatLon(position, center) < radius;
}
