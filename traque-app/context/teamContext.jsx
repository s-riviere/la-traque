import { useLocation } from "../hook/useLocation";
import { useSocketListener } from "../hook/useSocketListener";
import { createContext, useContext, useMemo, useRef, useState } from "react";
import { useSocket } from "./socketContext";
import { GameState } from "../util/gameState";
import useSendDeviceInfo from "../hook/useSendDeviceInfo";


const teamContext = createContext()
function TeamProvider({children}) {
    const [teamInfos, setTeamInfos] = useState({});
    const [gameState, setGameState] = useState(GameState.SETUP);
    const [gameSettings, setGameSettings] = useState(null);
    const [zoneExtremities, setZoneExtremities] = useState(null);
    const [nextZoneDate, setNextZoneDate] = useState(null);
    const [location, getLocationAuthorization, startLocationTracking, stopLocationTracking] = useLocation(5000, 10);
    const {teamSocket} = useSocket();
    const teamInfosRef = useRef();
    
    useSendDeviceInfo();

    teamInfosRef.current = teamInfos;

    function setCurrentZone(data) {
        const newBegin = {points : data.begin.points.map( p => ({latitude: p.lat,longitude: p.lng}) ), duration: data.begin.duration};
        const newEnd = {points : data.end.points.map( p => ({latitude: p.lat,longitude: p.lng}) ), duration: data.end.duration};
        setZoneExtremities({begin: newBegin, end: newEnd});
        setNextZoneDate(data.endDate);
    }

    useSocketListener(teamSocket, "update_team", (newTeamInfos) => {setTeamInfos({...teamInfosRef.current, ...newTeamInfos})});
    useSocketListener(teamSocket, "game_state", setGameState);
    useSocketListener(teamSocket, "current_zone", setCurrentZone);
    useSocketListener(teamSocket, "game_settings", setGameSettings);
    
    const value = useMemo(() => (
        {teamInfos, gameState, zoneExtremities, nextZoneDate, gameSettings, location, getLocationAuthorization, startLocationTracking, stopLocationTracking}
    ), [teamInfos, gameState, zoneExtremities, nextZoneDate, gameSettings, location]);
    return (
        <teamContext.Provider value={value}>
            {children}
        </teamContext.Provider>
    );
}

function useTeamContext() {
    return useContext(teamContext);
}

export { TeamProvider, useTeamContext };