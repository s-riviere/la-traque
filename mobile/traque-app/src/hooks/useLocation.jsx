// React
import { useState, useEffect } from 'react';
// Expo
import * as Location from 'expo-location';
// Constants
import { LOCATION_PARAMETERS } from '@/constants';

export const useLocation = () => {
    const [location, setLocation] = useState(null);

    useEffect(() => {
        let subscription;

        const startWatching = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted')  return;

            subscription = await Location.watchPositionAsync(
                LOCATION_PARAMETERS.LOCAL,
                (location) => setLocation([location.coords.latitude, location.coords.longitude])
            );
        };

        startWatching();

        return () => {
            if (subscription) subscription.remove();
        };
    }, []);

    return { location };
};
