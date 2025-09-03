"use client";
import { createContext, useContext, useMemo, useState } from "react";
import { useSocket } from "./socketContext";
import useSocketListener from "@/hook/useSocketListener";
import { GameState } from "@/util/gameState";

const adminContext = createContext();

export function AdminProvider({ children }) {
    const { adminSocket } = useSocket();
    // teams
    const [teams, setTeams] = useState([]);
    // game_state
    const [gameState, setGameState] = useState(GameState.SETUP);
    const [startDate, setStartDate] = useState(null);
    // current_zone
    const [zoneType, setZoneType] = useState(null);
    const [zoneExtremities, setZoneExtremities] = useState(null);
    const [nextZoneDate, setNextZoneDate] = useState(null);
    // settings
    const [messages, setMessages] = useState(null);
    const [zoneSettings, setZoneSettings] = useState(null)
    const [sendPositionDelay, setSendPositionDelay] = useState(null);
    const [outOfZoneDelay, setOutOfZoneDelay] = useState(null);

    useSocketListener(adminSocket, "teams", setTeams);

    useSocketListener(adminSocket, "game_state", (data) => {
        setGameState(data.state);
        setStartDate(data.date)
    });

    useSocketListener(adminSocket, "current_zone", (data) => {
        setZoneType(data.type);
        setZoneExtremities({begin: data.begin, end: data.end});
        setNextZoneDate(data.endDate);
    });

    useSocketListener(adminSocket, "settings", (data) => {
        setMessages(data.messages);
        setZoneSettings(data.zone);
        setSendPositionDelay(data.sendPositionDelay);
        setOutOfZoneDelay(data.outOfZoneDelay);
    });

    const value = useMemo(() => (
        { zoneSettings, teams, gameState, zoneType, zoneExtremities, sendPositionDelay, outOfZoneDelay, messages, nextZoneDate, startDate }
    ), [zoneSettings, teams, gameState, zoneType, zoneExtremities, sendPositionDelay, outOfZoneDelay, messages, nextZoneDate, startDate]);

    return (
        <adminContext.Provider value={value}>
            {children}
        </adminContext.Provider>
    );
}

export function useAdminContext() {
    return useContext(adminContext);
}
