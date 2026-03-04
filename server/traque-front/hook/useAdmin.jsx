"use client";
import { useAdminContext } from "@/context/adminContext";
import { useSocket } from "@/context/socketContext";

export default function useAdmin() {
    const adminContext = useAdminContext();
    const { teams } = adminContext;
    const { adminSocket } = useSocket();

    function getTeam(teamId) {
        return teams.find(team => team.id === teamId);
    }

    function addTeam(teamName) {
        adminSocket.emit("add-team", teamName);
    }

    function removeTeam(teamId) {
        adminSocket.emit("remove-team", teamId);
    }

    function reorderTeams(newOrder) {
        adminSocket.emit("reorder-teams", newOrder);
    }

    function captureTeam(teamId) {
        adminSocket.emit("capture_team", teamId);
    }

    function placementTeam(teamId, placementZone) {
        adminSocket.emit("placement_team", teamId, placementZone);
    }

    function changeState(state) {
        adminSocket.emit("state", state);
    }

    function updateSettings(settings) {
        adminSocket.emit("settings", settings);
    }

    return { ...adminContext, getTeam, reorderTeams, addTeam, removeTeam, captureTeam, placementTeam, changeState, updateSettings };
}
