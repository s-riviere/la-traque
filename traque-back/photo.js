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

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, UPLOAD_DIR);
    },
    filename: function (req, file, callback) {
        callback(null, req.query.team);
    }
});

function clean() {

    const files = fs.readdirSync(UPLOAD_DIR);

    for (const file of files) {
        const filePath = path.join(UPLOAD_DIR, file);
        fs.unlinkSync(filePath);
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, callback) {
        if (ALLOWED_MIME.indexOf(file.mimetype) == -1) {
            callback(null, false);
        } else if (!game.getTeam(Number(req.query.team))) {
            callback(null, false);
        } else {
            callback(null, true);
        }
    }
})


export function initPhotoUpload() {
    clean();
    app.post("/upload", upload.single('file'), (req, res) => {
        res.set("Access-Control-Allow-Origin", "*");
        console.log("upload", req.query)
        res.send("")
    })
    app.get("/photo/my", (req, res) => {
        let team = game.getTeam(Number(req.query.team));
        if (team) {
            res.set("Content-Type", "image/png")
            res.set("Access-Control-Allow-Origin", "*");
            res.sendFile(process.cwd() + "/" + UPLOAD_DIR + "/" + team.id);
        } else {
            res.send(400, "Team not found")
        }
    })
    app.get("/photo/enemy", (req, res) => {
        let team = game.getTeam(Number(req.query.team));
        if (team) {
            res.set("Content-Type", "image/png")
            res.set("Access-Control-Allow-Origin", "*");
            res.sendFile(process.cwd() + "/" + UPLOAD_DIR + "/" + team.chasing);
        } else {
            res.send(400, "Team not found")
        }
    })
}