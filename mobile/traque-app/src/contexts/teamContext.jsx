// React
import { createContext, useContext, useMemo, useState, useEffect } from "react";
// Context
import { useAuth } from "@/contexts/authContext";
// Services
import { socket } from "@/services/socket/connection";
// Constants
import { GAME_STATE } from "@/config";

const TeamContext = createContext(null);

const useOnEvent = (event, callback) => {
    useEffect(() => {
        socket.on(event, callback);
        return () => {
            socket.off(event, callback);
        };
    }, [event, callback]);
};

export const TeamProvider = ({ children }) => {
    const { logout } = useAuth();
    const [teamId, setTeamId] = useState(null);
    const [teamName, setTeamName] = useState(null);
    const [gameState, setGameState] = useState(GAME_STATE.SETUP);
    const [teamStateData, setTeamStateData] = useState({});

    useOnEvent("update-full", ({ id, name, gameState, stateData }) => {
        setTeamId(id);
        setTeamName(name);
        setGameState(gameState);
        setTeamStateData(stateData);
    });

    useOnEvent("logout", logout);

    const value = useMemo(() => (
        { teamId, teamName, gameState, teamStateData }
    ), [teamId, teamName, gameState, teamStateData]);

    return (
        <TeamContext.Provider value={value}>
            {children}
        </TeamContext.Provider>
    );
};

export const useTeam = () => {
    return useContext(TeamContext);
};
