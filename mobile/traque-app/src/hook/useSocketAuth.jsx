// React
import { useState, useEffect, useCallback, useRef } from 'react';
// Hook
import { useLocalStorage } from './useLocalStorage';
// Services
import { emitLogin, emitLogout } from "../services/socketEmitter";

export const useSocketAuth = () => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [savedPassword, setSavedPassword] = useLocalStorage("team_password", null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => { 
            isMounted.current = false;
        };
    }, []);

    const login = useCallback((password) => {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                if (!isMounted.current) return;
                console.warn("Server did not respond to login emit.");
                reject();
            }, 2000);
        
            emitLogin(password, (response) => {
                clearTimeout(timeout);
                
                if (!isMounted.current) return;

                if (response.isLoggedIn) {
                    console.log("Log in accepted.");
                    setLoggedIn(true);
                    setSavedPassword(password);
                    resolve(response);
                } else {
                    console.log("Log in refused.");
                    setLoggedIn(false);
                    reject();
                }
            });
        });
    }, [setSavedPassword]);

    useEffect(() => {
        if (!loggedIn && savedPassword) {
            login(savedPassword);
        }
    }, [loggedIn, login, savedPassword]);

    const logout = useCallback(() => {
        setLoggedIn(false);
        setSavedPassword(null);
        emitLogout();
    }, [setSavedPassword]);

    return {login, logout, password: savedPassword, loggedIn};
};
