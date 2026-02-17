// React
import { createContext, useContext, useMemo, useState, useEffect } from "react";
// Context
import { useTeamConnexion } from "./teamConnexionContext";
// Hook
import { useSendDeviceInfo } from "../hook/useSendDeviceInfo";
// Services
import { socket } from "../services/socket";
// Constants
import { GAME_STATE } from "../constants";

const TeamContext = createContext();

const useSocketListener = (event, callback) => {
    useEffect(() => {
        socket.on(event, callback);
        return () => {
            socket.off(event, callback);
        };
    }, [callback, event]);
};

export const TeamProvider = ({children}) => {
    // update_team
    const [teamInfos, setTeamInfos] = useState({});
    // game_state
    const [gameState, setGAME_STATE] = useState(GAME_STATE.SETUP);
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

    useSocketListener("update_team", (data) => {
        setTeamInfos(teamInfos => ({...teamInfos, ...data}));
    });

    useSocketListener("game_state", (data) => {
        setGAME_STATE(data.state);
        setStartDate(data.date);
    });

    useSocketListener("settings", (data) => {
        setMessages(data.messages);
        setZoneType(data.zone.type);
        //TODO
        //setSendPositionDelay(data.sendPositionDelay);
        //setOutOfZoneDelay(data.outOfZoneDelay);
    });

    useSocketListener("current_zone", (data) => {
        setZoneExtremities({begin: data.begin, end: data.end});
        setNextZoneDate(data.endDate);
    });

    useSocketListener("logout", logout);

    const value = useMemo(() => (
        {teamInfos, gameState, startDate, zoneType, zoneExtremities, nextZoneDate, messages}
    ), [teamInfos, gameState, startDate, zoneType, zoneExtremities, nextZoneDate, messages]);

    return (
        <TeamContext.Provider value={value}>
            {children}
        </TeamContext.Provider>
    );
};

export const useTeamContext = () => {
    return useContext(TeamContext);
};
