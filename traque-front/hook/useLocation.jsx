"use client";
import { useEffect, useState } from "react";

export default function useLocation(interval) {
    const [location, setLocation] = useState(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            console.log('Geolocation not supported');
            return;
        }
        
        if (interval < 1000 || interval == Infinity) {
            console.log('Localisation interval no supported');
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                setLocation({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    accuracy: pos.coords.accuracy,
                    timestamp: pos.timestamp
                });
            },
            (err) => console.log("Error :", err),
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: interval,
            }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    return location;
}
