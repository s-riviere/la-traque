import { createHash } from "crypto";
import { ADMIN_PASSWORD_HASH } from "@/config/server.js";
import { ADMIN_HANDLER_EVENTS } from "@/config/events.js";

export class AdminHandler {
    constructor(gameManager) {
        this.gameManager = gameManager;
    }

    init(io) {
        io.on("connection", (socket) => {
            console.log("Connection of an admin");
            new AdminConnection(socket, this.gameManager);
        });

        return this;
    }
}

class AdminConnection {
    constructor(socket, gameManager) {
        this._socket = socket;
        this._gameManager = gameManager;
        this._isLoggedIn = false;
        this._setupListeners();
    }

    _login(password) {
        if (this._isLoggedIn) return;
        
        const hash = createHash('sha256').update(password).digest('hex');
        if (hash !== ADMIN_PASSWORD_HASH) return false;

        this._isLoggedIn = true;
        this._gameManager.onAdminLogin(this._socket.id);
    }

    _logout() {
        if (!this._isLoggedIn) return;
        this._isLoggedIn = false;
    }

    _setupListeners() {

        // Authentication

        this._socket.on("disconnect", () => {
            console.log("Disconnection of an admin");
            this._logout()
        });

        this._socket.on(ADMIN_HANDLER_EVENTS.LOGIN, (password, callback) => {
            this._login(password);
            callback(this._isLoggedIn);
        });

        this._socket.on(ADMIN_HANDLER_EVENTS.LOGOUT, () => {
            this._logout()
        });

        // Actions

        const protectedActions = {
            [ADMIN_HANDLER_EVENTS.ADD_TEAM]: (id) => this._gameManager.addTeam(id),
            [ADMIN_HANDLER_EVENTS.REMOVE_TEAM]: (id) => this._gameManager.removeTeam(id),
            [ADMIN_HANDLER_EVENTS.REORDER_TEAM]: (id) => this._gameManager.reorderTeam(id),
            [ADMIN_HANDLER_EVENTS.ELIMINATE_TEAM]: (id) => this._gameManager.eliminate(id),
            [ADMIN_HANDLER_EVENTS.REVIVE_TEAM]: (id) => this._gameManager.revive(id),
            [ADMIN_HANDLER_EVENTS.STATE]: (state) => this._gameManager.setState(state),
            [ADMIN_HANDLER_EVENTS.SETTINGS]: (settings) => this._gameManager.setSettings(settings),
        };

        Object.entries(protectedActions).forEach(([event, action]) => {
            this._socket.on(event, (data) => {
                if (this._isLoggedIn) action(data);
            });
        });
    }
}
