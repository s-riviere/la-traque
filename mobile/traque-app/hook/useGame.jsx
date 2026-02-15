import { useSocket } from "../context/socketContext";
import { useTeamConnexion } from "../context/teamConnexionContext";
import { useTeamContext } from "../context/teamContext";

export const useGame = () => {
    const { teamSocket } = useSocket();
    const { teamId } = useTeamConnexion();
    const { teamInfos } = useTeamContext();
    
    function sendCurrentPosition() {
        console.log("Reveal position.");
        teamSocket.emit("send_position");
    }

    function capture(captureCode) {
        console.log("Try to capture :", captureCode);
    
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                console.warn("Server did not respond to capture emit.");
                reject();
            }, 3000);
        
            teamSocket.emit("capture", captureCode, (response) => {
                clearTimeout(timeout);
                console.log(response.message);
                resolve(response);
            });
        });
    }

    return {...teamInfos, sendCurrentPosition, capture, teamId};
};
