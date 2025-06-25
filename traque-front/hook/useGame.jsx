"use client";
import { useSocket } from "@/context/socketContext";
import { useTeamConnexion } from "@/context/teamConnexionContext";
import { useTeamContext } from "@/context/teamContext";

export default function useGame() {
    const { teamSocket } = useSocket();
    const { teamId } = useTeamConnexion();
    const { teamInfos, gameState } = useTeamContext();

    function sendCurrentPosition() {
        teamSocket.emit("send_position");
    }

    function capture(captureCode) {
        teamSocket.emit("capture", captureCode);
    }

    return {...teamInfos, sendCurrentPosition, capture, teamId, gameState};
}
