import { PLAYER_HANDLER_EVENTS } from "#config/events.js";

export class PlayerHandler {
    constructor(gameManager) {
        this.gameManager = gameManager;
    }

    init(io) {
        io.on("connection", (socket) => {
            console.log("Connection of a player");
            new PlayerConnection(socket, this.gameManager);
        });

        return this;
    }
}

class PlayerConnection {
    constructor(socket, gameManager) {
        this._socket = socket;
        this._gameManager = gameManager;
        this._teamId = null;
        this._setupListeners();
    }

    _isLoggedIn() {
        return this._teamId !== null;
    }

    _login(loginTeamId) {
        if (!this._gameManager.teams.has(loginTeamId) || this._teamId === loginTeamId) return;
        this._logout();
        this._teamId = loginTeamId;
        this._socket.join(this._teamId);
        this._gameManager.onPlayerLogin(this._socket.id, this._teamId);
    }

    _logout() {
        if (!this._isLoggedIn()) return;
        this._socket.leave(this._teamId);
        this._teamId = null;
    }

    _setupListeners() {
        
        // Authentication

        this._socket.on("disconnect", () => {
            console.log("Disconnection of a player");
            this._logout()
        });

        this._socket.on(PLAYER_HANDLER_EVENTS.LOGIN, (loginTeamId, callback) => {
            this._login(loginTeamId);
            callback(this._isLoggedIn());
        });

        this._socket.on(PLAYER_HANDLER_EVENTS.LOGOUT, () => {
            this._logout()
        });

        // Actions

        this._socket.on(PLAYER_HANDLER_EVENTS.LOCATION, (coords) => {
            if (this._isLoggedIn()) return;
            this._gameManager.updateLocation(this._teamId, coords);
        });

        this._socket.on(PLAYER_HANDLER_EVENTS.SCAN, (coords) => {
            if (this._isLoggedIn()) return;
            this._gameManager.updateLocation(this._teamId, coords);
            this._gameManager.scan(this._teamId);
        });

        this._socket.on(PLAYER_HANDLER_EVENTS.CAPTURE, (captureCode, callback) => {
            if (this._isLoggedIn()) return;
            callback(this._gameManager.capture(this._teamId, captureCode));
        });
    }
}
