"use client";
import { useAdminContext } from "@/context/adminContext";
import { useSocket } from "@/context/socketContext";

export default function useAdmin() {
    const adminContext = useAdminContext();
    const { teams } = adminContext;
    const { adminSocket } = useSocket();

    function pollTeams() {
        adminSocket.emit("get_teams");
    }

    function getTeam(teamId) {
        return teams.find(team => team.id === teamId);
    }

    function getTeamName(teamId) {
        let team = getTeam(teamId);
        return team ? team.name : "";
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

    function changeZoneSettings(zone) {
        adminSocket.emit("set_zone_settings", zone);
    }

    function changePenaltySettings(penalties) {
        adminSocket.emit("set_penalty_settings", penalties);
    }

    function changeGameSettings(settings) {
        adminSocket.emit("set_game_settings", settings);
    }
    return { ...adminContext, changeGameSettings, changeZoneSettings, changePenaltySettings, pollTeams, getTeam, getTeamName, reorderTeams, addTeam, removeTeam, changeState, updateTeam };

}
