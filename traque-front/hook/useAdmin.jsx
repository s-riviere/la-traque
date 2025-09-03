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

    function reorderTeams(newOrder) {
        adminSocket.emit("reorder_teams", newOrder);
    }

    function addTeam(teamName) {
        adminSocket.emit("add_team", teamName);
    }

    function removeTeam(teamId) {
        adminSocket.emit("remove_team", teamId);
    }

    function updateTeam(teamId, team) {
        adminSocket.emit("update_team", teamId, team);
    }

    function changeState(state) {
        adminSocket.emit("change_state", state);
    }

    function updateSettings(settings) {
        adminSocket.emit("update_settings", settings);
    }

    return { ...adminContext, getTeam, reorderTeams, addTeam, removeTeam, updateTeam, changeState, updateSettings };
}
