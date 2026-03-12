// React
import { createContext, useContext, useState, useCallback, useMemo } from "react";
// Hook
import { useLocalStorage } from '@/hooks/useLocalStorage';
// Services
import { emitLogin, emitLogout } from "@/services/socket/emitters";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [savedTeamId, setSavedTeamId] = useLocalStorage("team_id", null);

    const login = useCallback(async (teamId) => {
        if (isLoggedIn) return;
        if (await emitLogin(teamId)) {
            setIsLoggedIn(true); 
            setSavedTeamId(teamId);
            return true;
        } else {
            return false;
        }
    }, [isLoggedIn, setSavedTeamId]);

    const logout = useCallback(() => {
        if (!isLoggedIn) return;
        setIsLoggedIn(false);
        setSavedTeamId(null);
        emitLogout();
    }, [isLoggedIn, setSavedTeamId]);

    /*
    // Try to log in with saved savedTeamId
    useEffect(() => {
        if (!isLoggedIn && savedTeamId) {
            login(savedTeamId);
        }
    }, [isLoggedIn, savedTeamId, login]);

    // Emit battery level and phone model at log in
    useEffect(() => {
        if (!isLoggedIn) return;

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
    }, [isLoggedIn]);
    */

    const value = useMemo(() => ({ savedTeamId, isLoggedIn, login, logout }), [savedTeamId, isLoggedIn, login, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
