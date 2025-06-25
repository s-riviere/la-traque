"use client";
import { createContext, useContext, useMemo } from "react";
import { useSocket } from "./socketContext";
import useSocketAuth from "@/hook/useSocketAuth";
import usePasswordProtect from "@/hook/usePasswordProtect";

const teamConnexionContext = createContext();

export function TeamConnexionProvider({ children }) {
    const { teamSocket } = useSocket();
    const { login, password: teamId, loggedIn, loading, logout } = useSocketAuth(teamSocket, "team_password");
    const useProtect = () => usePasswordProtect("/team", "/team/track", loading, loggedIn);

    const value = useMemo(() => ({ teamId, login, logout, loggedIn, loading, useProtect}), [teamId, login, loggedIn, loading]);

    return (
        <teamConnexionContext.Provider value={value}>
            {children}
        </teamConnexionContext.Provider>
    );
}

export function useTeamConnexion() {
    return useContext(teamConnexionContext);
}
