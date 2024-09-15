import { createServer } from "http";
import express from "express";

import { Server } from "socket.io";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { initAdminSocketHandler } from "./admin_socket.js";
import { initTeamSocket } from "./team_socket.js";
import { initPhotoUpload } from "./photo.js";
//extract admin password from .env file
config();
const HOST = process.env.HOST;
const PORT = process.env.PORT;

export const app = express()

const httpServer = createServer({}, app);

httpServer.listen(PORT, HOST, () => {
  console.log("Server running on http://" + HOST + ":" + PORT);
});



//set cors to allow all origins
export const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

initAdminSocketHandler();
initTeamSocket();
initPhotoUpload();
