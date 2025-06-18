import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";
import { config } from "dotenv";
import { initAdminSocketHandler } from "./admin_socket.js";
import { initTeamSocket } from "./team_socket.js";
import { initPhotoUpload } from "./photo.js";
import { initTrajectories } from "./trajectory.js";

config();
const HOST = process.env.HOST;
const PORT = process.env.PORT;

export const app = express();

const httpServer = createServer({}, app);

httpServer.listen(PORT, HOST, () => {
  console.log("Server running on http://" + HOST + ":" + PORT);
});

export const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

initAdminSocketHandler();
initTeamSocket();
initPhotoUpload();
initTrajectories();
