"use client";
import { createContext, useContext, useMemo, useState } from "react";
import { useSocket } from "./socketContext";
import useSocketListener from "@/hook/useSocketListener";
import { GameState } from "@/util/types";

const adminContext = createContext();

export function AdminProvider({ children }) {
    const { adminSocket } = useSocket();
    const [gameState, setGameState] = useState(GameState.SETUP);
    const [teams, setTeams] = useState([]);
    const [zones, setZones] = useState(null);
    const [settings, setSettings] = useState(null);
    
    useSocketListener(adminSocket, "update-full", ({ gameState, teams, zones, settings }) => {
        setGameState(gameState);
        setTeams(teams);
        setZones(zones);
        setSettings(settings);
    });

    const value = useMemo(() => (
        { gameState, teams, zones, settings }
    ), [gameState, teams, zones, settings]);

    return (
        <adminContext.Provider value={value}>
            {children}
        </adminContext.Provider>
    );
}

export function useAdminContext() {
    return useContext(adminContext);
}
