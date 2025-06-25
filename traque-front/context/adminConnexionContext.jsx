"use client";
import { createContext, useContext,  useMemo } from "react";
import { useSocket } from "./socketContext";
import useSocketAuth from "@/hook/useSocketAuth";
import usePasswordProtect from "@/hook/usePasswordProtect";

const adminConnexionContext = createContext();

export function AdminConnexionProvider({ children }) {
    const { adminSocket } = useSocket();
    const { login, loggedIn, loading } = useSocketAuth(adminSocket, "admin_password");
    const useProtect = () => usePasswordProtect("/admin/login", "/admin", loading, loggedIn);

    const value = useMemo(() => ({ login, loggedIn, loading, useProtect }), [loggedIn, loading]);

    return (
        <adminConnexionContext.Provider value={value}>
            {children}
        </adminConnexionContext.Provider>
    );
}

export function useAdminConnexion() {
    return useContext(adminConnexionContext);
}
