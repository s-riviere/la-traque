export const PLAYER_HANDLER_EVENTS = {
    LOGIN: "login",
    LOGOUT: "logout",
    LOCATION: "location",
    SCAN: "scan",
    CAPTURE: "capture",
};

export const ADMIN_HANDLER_EVENTS = {
    LOGIN: "login",
    LOGOUT: "logout",
    STATE: "state",
    SETTINGS: "settings",
    ADD_TEAM: "add-team",
    REMOVE_TEAM: "remove-team",
    REORDER_TEAM: "reorder-team",
    ELIMINATE_TEAM: "eliminate-team",
    REVIVE_TEAM: "revive-team",
};

export const GAME_MANAGER_EVENTS = {
    INIT_PLAYER: "init-player",
    INIT_ADMIN: "init-admin",
    UPDATE_GAME: "update-game",
    DELETE_TEAM: "delete-team",
};

export const PLAYER_SYNCHRONIZER_EVENTS = {
    UPDATE_FULL: "update-full",
    LOGOUT: "logout",
};

export const ADMIN_SYNCHRONIZER_EVENTS = {
    UPDATE_FULL: "update-full",
};
