import multer from "multer";
import fs from "fs";
import path from "path";

export class PhotoService {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.uploadDir = path.join(process.cwd(), "teams_photos");
        this.missingImage = path.join(process.cwd(), "assets", "images", "missing_image.jpg");
        this.allowedMime = ["image/png", "image/jpeg", "image/gif"];
    }

    _initStorage() {
        if (fs.existsSync(this.uploadDir)) fs.rmSync(this.uploadDir, { recursive: true });
        fs.mkdirSync(this.uploadDir);
    }

    _setupMulter() {
        const storage = multer.diskStorage({
            destination: (req, file, cb) => cb(null, this.uploadDir),
            filename: (req, file, cb) => cb(null, `${req.query.team}`)
        });

        this.upload = multer({
            storage,
            fileFilter: (req, file, cb) => {
                const isAllowed = this.allowedMime.includes(file.mimetype);
                const teamExists = this.gameManager.teams.has(req.query.team);
                cb(null, isAllowed && teamExists);
            }
        });
    }

    _sendTeamImage(res, imageId) {
        const imagePath = path.join(this.uploadDir, imageId);
        res.set({
            "Content-Type": "image/png",
            "Access-Control-Allow-Origin": "*"
        });
        res.sendFile(fs.existsSync(imagePath) ? imagePath : this.missingImage);
    }

    init(app) {
        this._initStorage();
        this._setupMulter();
        
        app.post("/upload", this.upload.single('file'), (req, res) => {
            res.set("Access-Control-Allow-Origin", "*").send("");
        });

        app.get("/photo/my", (req, res) => {
            const team = this.gameManager.teams.get(req.query.team);
            if (!team) return res.status(400).send("Team not found");
            this._sendTeamImage(res, team.id);
        });

        app.get("/photo/enemy", (req, res) => {
            const team = this.gameManager.teams.get(req.query.team);
            if (!team) return res.status(400).send("Team not found");
            this._sendTeamImage(res, team.target.id);
        });

        return this;
    }
}
