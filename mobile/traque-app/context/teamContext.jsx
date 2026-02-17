// React
import { createContext, useContext, useMemo, useState } from "react";
// Context
import { useSocket } from "./socketContext";
import { useTeamConnexion } from "./teamConnexionContext";
// Hook
import { useSendDeviceInfo } from "../hook/useSendDeviceInfo";
import { useLocation } from "../hook/useLocation";
import { useSocketListener } from "../hook/useSocketListener";
// Util
import { GameState } from "../util/gameState";

const TeamContext = createContext();

export const TeamProvider = ({children}) => {
    const {teamSocket} = useSocket();
    const [location, getLocationAuthorization, startLocationTracking, stopLocationTracking] = useLocation(5000, 10);
    // update_team
    const [teamInfos, setTeamInfos] = useState({});
    // game_state
    const [gameState, setGameState] = useState(GameState.SETUP);
    const [startDate, setStartDate] = useState(null);
    // current_zone
    const [zoneExtremities, setZoneExtremities] = useState(null);
    const [nextZoneDate, setNextZoneDate] = useState(null);
    // settings
    const [messages, setMessages] = useState(null);
    const [zoneType, setZoneType] = useState(null);
    // logout
    const { logout } = useTeamConnexion();
    
    useSendDeviceInfo();

    useSocketListener(teamSocket, "update_team", (data) => {
        setTeamInfos(teamInfos => ({...teamInfos, ...data}));
    });

    useSocketListener(teamSocket, "game_state", (data) => {
        setGameState(data.state);
        setStartDate(data.date);
    });

    useSocketListener(teamSocket, "settings", (data) => {
        setMessages(data.messages);
        setZoneType(data.zone.type);
        //TODO
        //setSendPositionDelay(data.sendPositionDelay);
        //setOutOfZoneDelay(data.outOfZoneDelay);
    });

    useSocketListener(teamSocket, "current_zone", (data) => {
        setZoneExtremities({begin: data.begin, end: data.end});
        setNextZoneDate(data.endDate);
    });

    useSocketListener(teamSocket, "logout", logout);

    const value = useMemo(() => (
        {teamInfos, gameState, startDate, zoneType, zoneExtremities, nextZoneDate, messages, location, getLocationAuthorization, startLocationTracking, stopLocationTracking}
    ), [teamInfos, gameState, startDate, zoneType, zoneExtremities, nextZoneDate, messages, location, getLocationAuthorization, startLocationTracking, stopLocationTracking]);

    return (
        <TeamContext.Provider value={value}>
            {children}
        </TeamContext.Provider>
    );
};

export const useTeamContext = () => {
    return useContext(TeamContext);
};
