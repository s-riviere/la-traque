"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSocket } from "./socketContext";
import useSocketListener from "@/hook/useSocketListener";
import { useAdminConnexion } from "./adminConnexionContext";
import { GameState } from "@/util/gameState";

const adminContext = createContext();

export function AdminProvider({ children }) {
    const [teams, setTeams] = useState([]);
    const [zoneSettings, setZoneSettings] = useState(null)
    const [penaltySettings, setPenaltySettings] = useState(null);
    const [gameSettings, setGameSettings] = useState(null);
    const [zoneExtremities, setZoneExtremities] = useState(null);
    const [nextZoneDate, setNextZoneDate] = useState(null);
    const { adminSocket } = useSocket();
    const { loggedIn } = useAdminConnexion();
    const [gameState, setGameState] = useState(GameState.SETUP);
    const [startDate, setStartDate] = useState(null);

    // Send a request to get the teams when the user logs in
    useEffect(() => {
        adminSocket.emit("get_teams");
    }, [loggedIn]);

    function setCurrentZone(data) {
        setZoneExtremities({begin: data.begin, end: data.end});
        setNextZoneDate(data.endDate);
    }

    useSocketListener(adminSocket, "game_state", (data) => {setGameState(data.state); setStartDate(data.startDate)});
    useSocketListener(adminSocket, "teams", setTeams);
    useSocketListener(adminSocket, "zone_settings", setZoneSettings);
    useSocketListener(adminSocket, "game_settings", setGameSettings);
    useSocketListener(adminSocket, "penalty_settings", setPenaltySettings);
    useSocketListener(adminSocket, "current_zone", setCurrentZone);

    const value = useMemo(() => (
        { zoneExtremities, teams, zoneSettings, penaltySettings, gameSettings, gameState, nextZoneDate, startDate }
    ), [zoneSettings, teams, gameState, zoneExtremities, penaltySettings, gameSettings, nextZoneDate, startDate]);
    return (
        <adminContext.Provider value={value}>
            {children}
        </adminContext.Provider>
    );
}

export function useAdminContext() {
    return useContext(adminContext);
}
