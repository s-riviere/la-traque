// React
import { createContext, useContext, useMemo, useState, useEffect } from "react";
// Context
import { useAuth } from "@/contexts/authContext";
// Services
import { socket } from "@/services/socket/connection";
// Constants
import { GAME_STATE } from "@/constants";

const TeamContext = createContext(null);

const useOnEvent = (event, callback) => {
    useEffect(() => {
        socket.on(event, callback);
        return () => {
            socket.off(event, callback);
        };
    }, [event, callback]);
};

export const TeamProvider = ({children}) => {
    const { logout } = useAuth();
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

    useOnEvent("update_team", (data) => {
        setTeamInfos(teamInfos => ({...teamInfos, ...data}));
    });

    useOnEvent("game_state", (data) => {
        setGAME_STATE(data.state);
        setStartDate(data.date);
    });

    useOnEvent("settings", (data) => {
        setMessages(data.messages);
        setZoneType(data.zone.type);
        //TODO
        //setSendPositionDelay(data.sendPositionDelay);
        //setOutOfZoneDelay(data.outOfZoneDelay);
    });

    useOnEvent("current_zone", (data) => {
        setZoneExtremities({begin: data.begin, end: data.end});
        setNextZoneDate(data.endDate);
    });

    useOnEvent("logout", logout);

    const value = useMemo(() => (
        {teamInfos, gameState, startDate, zoneType, zoneExtremities, nextZoneDate, messages}
    ), [teamInfos, gameState, startDate, zoneType, zoneExtremities, nextZoneDate, messages]);

    return (
        <TeamContext.Provider value={value}>
            {children}
        </TeamContext.Provider>
    );
};

export const useTeam = () => {
    return useContext(TeamContext);
};
