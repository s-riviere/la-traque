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

    return {
        sendCurrentPosition,
        capture,
        enemyPosition: teamInfos?.enemyLocation || null,
        enemyName: teamInfos?.enemyName || null,
        currentPosition: teamInfos?.currentLocation || null,
        startingArea: teamInfos?.startingArea || null,
        captureCode: teamInfos?.captureCode || null,
        name: teamInfos?.name || null,
        ready: teamInfos?.ready || false,
        captured: teamInfos?.captured || false,
        locationSendDeadline: teamInfos?.locationSendDeadline || null,
        penalties: teamInfos?.penalties || 0,
        teamId,
        gameState,
    };
}
