import { useEffect, useState } from 'react';
import { useLocalStorage } from './useLocalStorage';

const LOGIN_MESSAGE = "login";
const LOGOUT_MESSAGE = "logout";

export function useSocketAuth(socket, passwordName) {
    const [loggedIn, setLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [waitingForResponse, setWaitingForResponse] = useState(false);
    const [hasTriedSavedPassword, setHasTriedSavedPassword] = useState(false);
    const [savedPassword, setSavedPassword, savedPasswordLoading] = useLocalStorage(passwordName, null);

    useEffect(() => {
        if (!loading && !hasTriedSavedPassword) {
            console.log("Try to log in with saved password :", savedPassword);
            setWaitingForResponse(true);

            const timeout = setTimeout(() => {
                console.warn("Server did not respond to login emit.");
                setWaitingForResponse(false);
            }, 3000);
            
            socket.emit(LOGIN_MESSAGE, savedPassword, (response) => {
                clearTimeout(timeout);
                console.log(response.message);
                setLoggedIn(response.isLoggedIn);
                setWaitingForResponse(false);
            });
            setHasTriedSavedPassword(true);
        }
    }, [loading]);

    function login(password) {
        console.log("Try to log in with :", password);
        setSavedPassword(password);
        setWaitingForResponse(true);
        
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                console.warn("Server did not respond to login emit.");
                setWaitingForResponse(false);
                reject();
            }, 3000);
        
            socket.emit(LOGIN_MESSAGE, password, (response) => {
                clearTimeout(timeout);
                console.log(response.message);
                setLoggedIn(response.isLoggedIn);
                setWaitingForResponse(false);
                resolve(response);
            });
        });
    }

    function logout() {
        console.log("Logout");
        setSavedPassword(null);
        setLoggedIn(false);
        socket.emit(LOGOUT_MESSAGE);
    }

    useEffect(() => {
        if(!waitingForResponse && !savedPasswordLoading) {
            setLoading(false);
        } else {
            setLoading(true);
        }
    }, [waitingForResponse, savedPasswordLoading]);

    return {login, logout, password: savedPassword, loggedIn, loading};
}