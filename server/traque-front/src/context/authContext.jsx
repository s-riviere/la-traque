"use client";
import { createContext, useContext, useState, useMemo, useCallback } from "react";
import useLocalStorage from "@/hook/useLocalStorage";
import { emitLogin, emitLogout } from '@/services/socket/emitters';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [savedPassword, setSavedPassword] = useLocalStorage("admin_password", null);

    const login = useCallback(async (password) => {
        if (isLoggedIn) return;
        if (await emitLogin(password)) {
            setIsLoggedIn(true); 
            setSavedPassword(password);
            return true;
        } else {
            return false;
        }
    }, [isLoggedIn, setSavedPassword]);

    const logout = useCallback(() => {
        if (!isLoggedIn) return;
        setSavedPassword(null);
        setIsLoggedIn(false);
        emitLogout();
    }, [isLoggedIn, setSavedPassword]);
        
    /*
    useEffect(() => {
        if (!isLoggedIn && savedPassword) {
            login(savedPassword)
        }
    }, [savedPassword]);
    */

    const value = useMemo(() => ({ isLoggedIn, login, logout }), [isLoggedIn, login, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
