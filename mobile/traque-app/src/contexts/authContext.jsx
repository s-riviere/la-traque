// React
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import DeviceInfo from 'react-native-device-info';
// Hook
import { useLocalStorage } from '../hooks/useLocalStorage';
// Services
import { emitLogin, emitLogout, emitBattery, emitDeviceInfo } from "../services/socket/emitters";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [teamId, setTeamId] = useLocalStorage("team_id", null);

    const login = useCallback(async (password) => {
        if (loggedIn != false) return;

        try {
            const response = await emitLogin(password);
            setLoggedIn(response.isLoggedIn); 
            if (response.isLoggedIn) setTeamId(password);
            return response.isLoggedIn;
        } catch (error) {
            setLoggedIn(false); 
            throw error;
        }
    }, [loggedIn, setTeamId]);

    const logout = useCallback(() => {
        if (loggedIn != true) return;

        setLoggedIn(false);
        setTeamId(null);
        emitLogout();
    }, [loggedIn, setTeamId]);

    // Try to log in with saved teamId
    useEffect(() => {
        if (!loggedIn && teamId) {
            login(teamId);
        }
    }, [loggedIn, teamId, login]);

    // Emit battery level and phone model at log in
    useEffect(() => {
        if (!loggedIn) return;

        const sendInfo = async () => {
            const [brand, model, name] = await Promise.all([
                DeviceInfo.getBrand(),
                DeviceInfo.getModel(),
                DeviceInfo.getDeviceName()
            ]);
            emitDeviceInfo({model: brand + " " + model, name: name});
        };

        const sendBattery = async () => {
            const level = await DeviceInfo.getBatteryLevel();
            emitBattery(Math.round(level * 100));
        };

        sendInfo();
        sendBattery();
        const batteryCheckInterval = setInterval(() => sendBattery(), 5*60*1000); // 5 minutes
        
        return () => clearInterval(batteryCheckInterval);
    }, [loggedIn]);

    const value = useMemo(() => ({ teamId, loggedIn, login, logout}), [teamId, loggedIn, login, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
