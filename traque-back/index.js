import { createServer } from "https";
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

const httpsServer = createServer({
  key: readFileSync(process.env.SSL_KEY, 'utf-8'),
  cert: readFileSync(process.env.SSL_CERT, 'utf-8')
}, app);

httpsServer.listen(PORT, HOST, () => {
  console.log(`Server running`);
});



//set cors to allow all origins
export const io = new Server(httpsServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

initAdminSocketHandler();
initTeamSocket();
initPhotoUpload();