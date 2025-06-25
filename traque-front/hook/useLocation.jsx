"use client";
import { useEffect, useState } from "react";

export default function useLocation(interval) {
    const [location, setLocation] = useState();

    useEffect(() => {
        function update() {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation([position.coords.latitude, position.coords.longitude]);
                    if(interval != Infinity) {
                        setTimeout(update, interval);
                    }
                },
                () => { },
                { enableHighAccuracy: true, timeout: Infinity, maximumAge: 0 }
            );
        }

        update();
    }, []);

    return location;
}
