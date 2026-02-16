export const circleToPolygon = (circle) => {
    // circle  : {center: {latitude: ..., longitude: ...}, radius: ...}
    // polygon : [{latitude: ..., longitude: ...}, ...]
    const polygon = [];
    const center = circle.center;
    const radiusInDegrees = circle.radius / 111320; // Approximation m -> deg

    for (let i = 0; i < 360; i += 5) {
        const rad = (i * Math.PI) / 180;
        polygon.push({
            latitude: center.latitude + radiusInDegrees * Math.sin(rad),
            longitude: center.longitude + radiusInDegrees * Math.cos(rad) / Math.cos(center.latitude * Math.PI / 180),
        });
    }

    return polygon;
};

export const secondsToMMSS = (seconds) => {
    if (!Number.isInteger(seconds)) return "Inconnue";
    if (seconds < 0) seconds = 0;
    const strMinutes = String(Math.floor(seconds / 60));
    const strSeconds = String(Math.floor(seconds % 60));
    return strMinutes.padStart(2,"0") + ":" + strSeconds.padStart(2,"0");
};

export const  secondsToHHMMSS = (seconds) => {
    if (!Number.isInteger(seconds)) return "Inconnue";
    if (seconds < 0) seconds = 0;
    const strHours = String(Math.floor(seconds / 3600));
    const strMinutes = String(Math.floor(seconds / 60 % 60));
    const strSeconds = String(Math.floor(seconds % 60));
    return strHours.padStart(2,"0") + ":" + strMinutes.padStart(2,"0") + ":" + strSeconds.padStart(2,"0");
};
