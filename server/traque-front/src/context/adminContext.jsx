"use client";
import { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import { GameState } from "@/config/types";
import { socket } from "../services/socket/connection";

const AdminContext = createContext(null);

const useOnEvent = (event, callback) => {
    useEffect(() => {
        socket.on(event, callback);
        return () => {
            socket.off(event, callback);
        };
    }, [event, callback]);
};

export function AdminProvider({ children }) {
    const [gameState, setGameState] = useState(GameState.SETUP);
    const [teams, setTeams] = useState([]);
    const [zones, setZones] = useState(null);
    const [settings, setSettings] = useState(null);
    
    useOnEvent("update-full", ({ gameState, teams, zones, settings }) => {
        setGameState(gameState);
        setTeams(teams);
        setZones(zones);
        setSettings(settings);
    });

    const getTeam = useCallback((teamId) => {
        return teams.find(team => team.id === teamId);
    }, [teams]);

    const value = useMemo(() => (
        { gameState, teams, zones, settings, getTeam }
    ), [gameState, teams, zones, settings, getTeam]);

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    return useContext(AdminContext);
}
