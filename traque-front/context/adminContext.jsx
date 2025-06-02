"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSocket } from "./socketContext";
import { useSocketListener } from "@/hook/useSocketListener";
import { useAdminConnexion } from "./adminConnexionContext";
import { GameState } from "@/util/gameState";

const adminContext = createContext();

function AdminProvider({ children }) {
    const [teams, setTeams] = useState([]);
    const [zoneSettings, setZoneSettings] = useState(null)
    const [penaltySettings, setPenaltySettings] = useState(null);
    const [gameSettings, setGameSettings] = useState(null);
    const [zone, setZone] = useState(null);
    const [zoneExtremities, setZoneExtremities] = useState(null);
    const [nextZoneDate, setNextZoneDate] = useState(null);
    const [isShrinking, setIsShrinking] = useState(false);
    const { adminSocket } = useSocket();
    const { loggedIn } = useAdminConnexion();
    const [gameState, setGameState] = useState(GameState.SETUP);

    useSocketListener(adminSocket, "game_state", setGameState);
    //Send a request to get the teams when the user logs in
    useEffect(() => {
        adminSocket.emit("get_teams");
    }, [loggedIn]);

    function waiting(data) {
        setIsShrinking(false);
        setZoneExtremities({begin: data.begin, end: data.end});
        setNextZoneDate(data.endDate);
    }

    function shrinking(data) {
        setIsShrinking(true);
        setNextZoneDate(data);
    }

    //Bind listeners to update the team list and the game status on socket message
    useSocketListener(adminSocket, "teams", setTeams);
    useSocketListener(adminSocket, "zone_settings", setZoneSettings);
    useSocketListener(adminSocket, "game_settings", setGameSettings);
    useSocketListener(adminSocket, "penalty_settings", setPenaltySettings);
    useSocketListener(adminSocket, "zone", setZone);
    useSocketListener(adminSocket, "zone_start", shrinking);
    useSocketListener(adminSocket, "new_zone", waiting);

    const value = useMemo(() => ({ zone, zoneExtremities, teams, zoneSettings, penaltySettings, gameSettings, gameState, nextZoneDate, isShrinking }), [zoneSettings, teams, gameState, zone, zoneExtremities, penaltySettings, gameSettings, nextZoneDate, isShrinking]);
    return (
        <adminContext.Provider value={value}>
            {children}
        </adminContext.Provider>
    );
}

function useAdminContext() {
    return useContext(adminContext);
}

export { AdminProvider, useAdminContext };