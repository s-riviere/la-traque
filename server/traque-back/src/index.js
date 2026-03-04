import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";
// Core
import { GameManager } from "#core/managers/game_manager.js";
// Externals
import { PhotoService } from "#externals/api/photo.js";
import { PlayerSynchronizer } from "#externals/synchronizers/player_synchronizer.js";
import { PlayerHandler } from "#externals/handlers/playerHandler.js";
import { AdminSynchronizer } from "#externals/synchronizers/admin_synchronizer.js";
import { AdminHandler } from "#externals/handlers/adminHandler.js";
// Config
import { PORT, HOST } from "#config/server.js";
import { DEFAULT_GAME_SETTINGS, STATE_SETTINGS } from "#config/game.js";


// Configuration
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

// Initialization
const gameManager = new GameManager(STATE_SETTINGS, DEFAULT_GAME_SETTINGS);

new PhotoService(gameManager).init(app);

new PlayerHandler(gameManager).init(io.of("player"));
new AdminHandler(gameManager).init(io.of("admin"));

new PlayerSynchronizer(gameManager).init(io.of("player"));
new AdminSynchronizer(gameManager).init(io.of("admin"));


// Server start
httpServer.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});
