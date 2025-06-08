import fs from "fs";
import path from "path";
const UPLOAD_DIR = "trajectories";
const EXTENSION = "txt";

// Useful functions

function teamIDToPath(teamID) {
    return path.join(UPLOAD_DIR, teamID + "." + EXTENSION);
}

function dataToLine(...data) {
    return data.join(',');
}

const errorFile = (err) => {
    if (err) console.error("Error appending to file:", err);
};

function addLineToFile(teamID, line) {
    // Insert the line in the file of teamID depending on the date (lines are sorted by date)
    if (!fs.existsSync(teamIDToPath(teamID))) {
        fs.writeFile(teamIDToPath(teamID), line + '\n', errorFile);
    } else {
        fs.readFile(teamIDToPath(teamID), 'utf8', (err, data) => {
            if (err) {
                errorFile(err);
                return;
            }
            let lines = data.trim().split('\n');
            const newDate = parseInt(line.split(',')[0], 10);
            let insertIndex = lines.length;
            for (let i = lines.length - 1; i >= 0; i--) {
                const date = parseInt(lines[i].split(',')[0], 10);
                if (date <= newDate) {
                    insertIndex = i + 1;
                    break;
                }
            }
            lines.splice(insertIndex, 0, line);
            fs.writeFile(teamIDToPath(teamID), lines.join('\n') + '\n', errorFile);
        });
    }
}

// Export functions

export async function initTrajectories() {
    const files = fs.readdirSync(UPLOAD_DIR);
    for (const file of files) fs.unlinkSync(path.join(UPLOAD_DIR, file));
}

export function writePosition(date, teamID, lon, lat) {
    addLineToFile(teamID, dataToLine(date, "position", lon, lat));
}

export function writeCapture(date, teamID, capturedTeamID) {
    addLineToFile(teamID, dataToLine(date, "capture", capturedTeamID));
    addLineToFile(capturedTeamID, dataToLine(date, "captured", teamID));
}

export function writeSeePosition(date, teamID, seenTeamID) {
    addLineToFile(teamID, dataToLine(date, "see"));
    addLineToFile(seenTeamID, dataToLine(date, "seen"));
}
