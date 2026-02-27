import { config } from "dotenv";

config();

export const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";
export const HOST = process.env.HOST || "0.0.0.0";
export const PORT = Number(process.env.PORT) || 3000;

export const EARTH_RADIUS = 6_371_000; // Radius of the earth in meters

export const randint = (max) => {
    return Math.floor(Math.random() * max);
}

export const haversineDistance = ({ lat: lat1, lng: lon1 }, { lat: lat2, lng: lon2 }) => {
    // Return the distance in meters between the two points of coordinates
    const degToRad = (deg) => deg * (Math.PI / 180);
    const dLat = degToRad(lat2 - lat1);
    const dLon = degToRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * EARTH_RADIUS * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
