// Expo
import { defineTask, isTaskRegisteredAsync } from "expo-task-manager";
import * as Location from 'expo-location';
// Services
import { emitUpdatePosition } from "@/services/socket/emitters";
// Constants
import { TASKS, LOCATION_PARAMETERS } from "@/constants";


// Task
    
defineTask(TASKS.BACKGROUND_LOCATION, async ({ data, error }) => {
    if (error) {
        console.error(error);
        return;
    }
    if (data) {
        // @ts-ignore
        const { locations } = data;
        if (locations.length == 0) {
            console.log("No location measured.");
            return;
        }
        const { latitude, longitude } = locations[0].coords;
        emitUpdatePosition([latitude, longitude]);
    }
});


// Functions

export const getLocationAuthorization = async () => {
    const { status : statusForeground } = await Location.requestForegroundPermissionsAsync();
    const { status : statusBackground } = await Location.requestBackgroundPermissionsAsync();
    return statusForeground == "granted" && statusBackground == "granted";
};

export const startLocationTracking = async () => {
    if (!(await getLocationAuthorization())) return;
    if (await isTaskRegisteredAsync(TASKS.BACKGROUND_LOCATION)) return;
    console.log("Location tracking started.");
    await Location.startLocationUpdatesAsync(TASKS.BACKGROUND_LOCATION, LOCATION_PARAMETERS.SERVER);
};

export const stopLocationTracking = async () => {
    if (!await isTaskRegisteredAsync(TASKS.BACKGROUND_LOCATION)) return;
    console.log("Location tracking stopped.");
    await Location.stopLocationUpdatesAsync(TASKS.BACKGROUND_LOCATION);
};
