// React
import { useEffect, useState, useCallback, useMemo } from "react";
import { Alert } from "react-native";
// Expo
import { defineTask, isTaskRegisteredAsync } from "expo-task-manager";
import * as Location from 'expo-location';
// Hook
import { useSocketCommands } from "./useSocketCommands";

export const useLocation = (timeInterval, distanceInterval) => {
    const { emitUpdatePosition } = useSocketCommands();
    const [location, setLocation] = useState(null); // [latitude, longitude]
    const LOCATION_TASK_NAME = "background-location-task";
    const locationUpdateParameters = useMemo(() => ({
        accuracy: Location.Accuracy.High,
        distanceInterval: distanceInterval, // Update every 10 meters
        timeInterval: timeInterval, // Minimum interval in ms
        showsBackgroundLocationIndicator: true, // iOS only
        pausesUpdatesAutomatically: false, // (iOS) Prevents auto-pausing of location updates
        foregroundService: {
            notificationTitle: "Enregistrement de votre position.",
            notificationBody: "L'application utilise votre position en arrière plan.",
            notificationColor: "#FF0000", // (Android) Notification icon color
        },
    }), [distanceInterval, timeInterval]);
    
    defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
        if (error) {
            console.error(error);
            return;
        }
        if (data) {
            const { locations } = data;
            if (locations.length > 0) {
                const firstLocation = locations[0];
                const { latitude, longitude } = firstLocation.coords;
                const new_location = [latitude, longitude];
                try {
                    setLocation(new_location);
                } catch (e) {
                    console.warn("setLocation failed (probably in background):", e);
                }
                emitUpdatePosition(new_location);
            } else {
                console.log("No location measured.");
            }
        }
    });

    const getLocationAuthorization = useCallback(async () => {
        const { status : statusForeground } = await Location.requestForegroundPermissionsAsync();
        const { status : statusBackground } = await Location.requestBackgroundPermissionsAsync();
        if (statusForeground !== "granted" || statusBackground !== "granted") {
            Alert.alert("Échec", "Activez la localisation en arrière plan dans les paramètres.");
            return false;
        } else {
            return true;
        }
    }, []);

    const startLocationTracking = useCallback(async () => {
        if (await getLocationAuthorization()) {
            if (!(await isTaskRegisteredAsync(LOCATION_TASK_NAME))) {
                await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, locationUpdateParameters);
                console.log("Location tracking started.");
            }
        }
    }, [getLocationAuthorization, locationUpdateParameters]);

    const stopLocationTracking = useCallback(async () => {
        if (await isTaskRegisteredAsync(LOCATION_TASK_NAME)) {
            await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
            console.log("Location tracking stopped.");
        }
    }, []);

    useEffect(() => {
        getLocationAuthorization();
    }, [getLocationAuthorization]);

    return [location, getLocationAuthorization, startLocationTracking, stopLocationTracking];
};
