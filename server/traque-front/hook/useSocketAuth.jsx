"use client";
import { useEffect, useState } from 'react';
import useSocketListener from './useSocketListener';
import useLocalStorage from './useLocalStorage';

const LOGIN_MESSAGE = "login";
const LOGOUT_MESSAGE = "logout";
const LOGIN_RESPONSE_MESSAGE = "login_response";

export default function useSocketAuth(socket, passwordName) {
    const [loggedIn, setLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [waitingForResponse, setWaitingForResponse] = useState(true);
    const [savedPassword, setSavedPassword, savedPasswordLoading] = useLocalStorage(passwordName, null);
    
    useEffect(() => {
        if (savedPassword && !loggedIn) {
            console.log("Try to log with :", savedPassword);
            socket.emit(LOGIN_MESSAGE, savedPassword);
        }
    }, [savedPassword]);

    function login(password) {
        setSavedPassword(password)
    }

    function logout() {
        setSavedPassword(null);
        setLoggedIn(false);
        socket.emit(LOGOUT_MESSAGE)
    }

    useSocketListener(socket, LOGIN_RESPONSE_MESSAGE, (loginResponse) => {
        setWaitingForResponse(false);
        setLoggedIn(loginResponse);
        console.log(loginResponse ? "Logged in" : "Not logged in");
    });

    useEffect(() => {
        //There is a password saved and we recieved a login response
        if(savedPassword && !waitingForResponse && !savedPasswordLoading) {
            setLoading(false);
        }
        //We tried to load the saved password but it is not there
        else if (savedPassword == null && !savedPasswordLoading) {
            setLoading(false);
        }
    }, [waitingForResponse, savedPasswordLoading, savedPassword]);


    return {login, logout, password: savedPassword, loggedIn, loading};
}
