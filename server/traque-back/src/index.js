import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";
import { initAdminSocketHandler } from "@/socket/adminHandler.js";
import { initPlayerSocketHandler } from "@/socket/playerHandler.js";
import { initPhotoUpload } from "./services/photo.js";
import { PORT, HOST } from "@/util/util.js";

// --- Configuration ---
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

// --- Initialization ---
initPhotoUpload(app);
initAdminSocketHandler(io);
initPlayerSocketHandler(io);

// --- Server Start ---
httpServer.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});
