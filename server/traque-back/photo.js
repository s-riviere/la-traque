/*
This module manages the handler for uploading photos, as well as serving the correct file on requests based on the team ID and current game state
*/
import { app } from "./index.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import game from "./game.js";
const UPLOAD_DIR = "uploads/"
const ALLOWED_MIME = [
    "image/png",
    "image/jpeg",
    "image/gif"
]

// Setup multer (the file upload middleware)
const storage = multer.diskStorage({
    // Save the file in the uploads directory
    destination: function (req, file, callback) {
        callback(null, UPLOAD_DIR);
    },
    // Save the file with the team ID as the filename
    filename: function (req, file, callback) {
        callback(null, req.query.team);
    }
});

const upload = multer({
    storage,
    // Only upload the file if it is a valid mime type and the team POST parameter is a valid team
    fileFilter: function (req, file, callback) {
        if (ALLOWED_MIME.indexOf(file.mimetype) == -1) {
            callback(null, false);
        } else if (!game.getTeam(req.query.team)) {
            callback(null, false);
        } else {
            callback(null, true);
        }
    }
})

// Clean the uploads directory
function clean() {
    const files = fs.readdirSync(UPLOAD_DIR);
    for (const file of files) {
        const filePath = path.join(UPLOAD_DIR, file);
        fs.unlinkSync(filePath);
    }
}

export function initPhotoUpload() {
    clean();
    //App handler for uploading a photo and saving it to a file
    app.post("/upload", upload.single('file'), (req, res) => {
        res.set("Access-Control-Allow-Origin", "*");
        console.log("upload", req.query)
        res.send("")
    })
    //App handler for serving the photo of a team given its secret ID
    app.get("/photo/my", (req, res) => {
        let team = game.getTeam(req.query.team);
        if (team) {
            const imagePath = path.join(process.cwd(), UPLOAD_DIR, team.id);
            res.set("Content-Type", "image/png")
            res.set("Access-Control-Allow-Origin", "*");
            res.sendFile(fs.existsSync(imagePath) ? imagePath : path.join(process.cwd(), "images", "missing_image.jpg"));
        } else {
            res.status(400).send("Team not found")
        }
    })
    //App handler for serving the photo of the team chased by the team given by its secret ID
    app.get("/photo/enemy", (req, res) => {
        let team = game.getTeam(req.query.team);
        if (team) {
            const imagePath = path.join(process.cwd(), UPLOAD_DIR, team.chasing);
            res.set("Content-Type", "image/png")
            res.set("Access-Control-Allow-Origin", "*");
            res.sendFile(fs.existsSync(imagePath) ? imagePath : path.join(process.cwd(), "images", "missing_image.jpg"));
        } else {
            res.status(400).send("Team not found")
        }
    })
}