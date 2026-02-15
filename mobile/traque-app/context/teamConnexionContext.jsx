import { createContext, useContext, useMemo } from "react";
import { useSocket } from "./socketContext";
import { useSocketAuth } from "../hook/useSocketAuth";

const teamConnexionContext = createContext();

export const TeamConnexionProvider = ({ children }) => {
    const { teamSocket } = useSocket();
    const { login, password: teamId, loggedIn, loading, logout  } = useSocketAuth(teamSocket, "team_password");

    const value = useMemo(() => ({ teamId, login, logout, loggedIn, loading}), [teamId, login, logout, loggedIn, loading]);

    return (
        <teamConnexionContext.Provider value={value}>
            {children}
        </teamConnexionContext.Provider>
    );
};

export const useTeamConnexion = () => {
    return useContext(teamConnexionContext);
};
