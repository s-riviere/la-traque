import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { defineTask, isTaskRegisteredAsync } from "expo-task-manager";
import * as Location from 'expo-location';
import { useSocket } from "../context/socketContext";

export const useLocation = (timeInterval, distanceInterval) => {
    const [location, setLocation] = useState(null); // [latitude, longitude]
    const { teamSocket } = useSocket();
    const LOCATION_TASK_NAME = "background-location-task";
    const locationUpdateParameters = {
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
    };
    
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
                console.log("Sending position :", new_location);
                teamSocket.emit("update_position", new_location);
            } else {
                console.log("No location measured.");
            }
        }
    });

    useEffect(() => {
        getLocationAuthorization();
    }, []);

    async function getLocationAuthorization() {
        const { status : statusForeground } = await Location.requestForegroundPermissionsAsync();
        const { status : statusBackground } = await Location.requestBackgroundPermissionsAsync();
        if (statusForeground !== "granted" || statusBackground !== "granted") {
            Alert.alert("Échec", "Activez la localisation en arrière plan dans les paramètres.");
            return false;
        } else {
            return true;
        }
    }

    async function startLocationTracking() {
        if (await getLocationAuthorization()) {
            if (!(await isTaskRegisteredAsync(LOCATION_TASK_NAME))) {
                await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, locationUpdateParameters);
                console.log("Location tracking started.");
            }
        }
    }

    async function stopLocationTracking() {
        if (await isTaskRegisteredAsync(LOCATION_TASK_NAME)) {
            await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
            console.log("Location tracking stopped.");
        }
    }

    return [location, getLocationAuthorization, startLocationTracking, stopLocationTracking];
};
