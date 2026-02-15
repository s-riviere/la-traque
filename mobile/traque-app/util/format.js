export const secondsToMMSS = (seconds) => {
    if (!Number.isInteger(seconds)) return "Inconnue";
    if (seconds < 0) seconds = 0;
    const strMinutes = String(Math.floor(seconds / 60));
    const strSeconds = String(Math.floor(seconds % 60));
    return strMinutes.padStart(2,"0") + ":" + strSeconds.padStart(2,"0");
};

export const  secondsToHHMMSS = (seconds) => {
    if (!Number.isInteger(seconds)) return "Inconnue";
    if (seconds < 0) seconds = 0;
    const strHours = String(Math.floor(seconds / 3600));
    const strMinutes = String(Math.floor(seconds / 60 % 60));
    const strSeconds = String(Math.floor(seconds % 60));
    return strHours.padStart(2,"0") + ":" + strMinutes.padStart(2,"0") + ":" + strSeconds.padStart(2,"0");
};
