// React
import { createContext, useContext, useMemo } from "react";
// Hook
import { useSocketAuth } from "../hook/useSocketAuth";

const TeamConnexionContext = createContext();

export const TeamConnexionProvider = ({ children }) => {
    const { login, password: teamId, loggedIn, logout } = useSocketAuth();

    const value = useMemo(() => ({ teamId, login, logout, loggedIn}), [teamId, login, logout, loggedIn]);

    return (
        <TeamConnexionContext.Provider value={value}>
            {children}
        </TeamConnexionContext.Provider>
    );
};

export const useTeamConnexion = () => {
    return useContext(TeamConnexionContext);
};
