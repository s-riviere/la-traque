export const INITIAL_REGIONS = {
    PARIS : {
        latitude: 48.864,
        longitude: 2.342,
        latitudeDelta: 0,
        longitudeDelta: 50
    },
    TELECOM_PARIS : {
        latitude: 48.715,
        longitude: 2.203,
        latitudeDelta: 0, 
        longitudeDelta: 0.04
    }
};

export const LOCATION_PARAMETERS = {
    LOCAL: {
        accuracy: 4, // High
        distanceInterval: 3, // meters
        timeInterval: 1000, // ms
    },
    SERVER: {
        accuracy: 4, // High
        distanceInterval: 5, // meters
        timeInterval: 5000, // ms
        showsBackgroundLocationIndicator: true, // iOS only
        pausesUpdatesAutomatically: false, // (iOS) Prevents auto-pausing of location updates
        foregroundService: {
            notificationTitle: "Enregistrement de votre position.",
            notificationBody: "L'application utilise votre position en arrière plan.",
            notificationColor: "#FF0000", // (Android) Notification icon color
        },
    }
};

export const TASKS = {
    BACKGROUND_LOCATION: "background-location-task"
};
