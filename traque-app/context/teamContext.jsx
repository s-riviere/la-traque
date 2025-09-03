import { useLocation } from "../hook/useLocation";
import { useSocketListener } from "../hook/useSocketListener";
import { createContext, useContext, useMemo, useRef, useState } from "react";
import { useSocket } from "./socketContext";
import { GameState } from "../util/gameState";
import useSendDeviceInfo from "../hook/useSendDeviceInfo";
import { useTeamConnexion } from "./teamConnexionContext";

const teamContext = createContext();

const zoneTypes = {
    circle: "circle",
    polygon: "polygon"
}

function TeamProvider({children}) {
    const { logout } = useTeamConnexion();
    const [teamInfos, setTeamInfos] = useState({});
    const [gameState, setGameState] = useState(GameState.SETUP);
    const [gameSettings, setGameSettings] = useState(null);
    const [zoneType, setZoneType] = useState(null);
    const [zoneExtremities, setZoneExtremities] = useState(null);
    const [nextZoneDate, setNextZoneDate] = useState(null);
    const [location, getLocationAuthorization, startLocationTracking, stopLocationTracking] = useLocation(5000, 10);
    const {teamSocket} = useSocket();
    const teamInfosRef = useRef();
    
    useSendDeviceInfo();

    teamInfosRef.current = teamInfos;

    function setZone(data) {
        setZoneType(data.type);
        switch (data.type) {
            case zoneTypes.circle:
                setZoneExtremities({
                    begin: {...data.begin, ...{center : {latitude: data.begin.center.lat, longitude: data.begin.center.lng} }},
                    end: {...data.end, ...{center : {latitude: data.end.center.lat, longitude: data.end.center.lng} }}
                });
                break;
            case zoneTypes.polygon:
                setZoneExtremities({
                    begin: {...data.begin, ...{points : data.begin.points.map( p => ({latitude: p.lat,longitude: p.lng}) )}},
                    end: {...data.end, ...{points : data.end.points.map( p => ({latitude: p.lat,longitude: p.lng}) )}}
                });
                break;
            default:
                setZoneExtremities({begin: data.begin, end: data.end});
                break;
        }
        setNextZoneDate(data.endDate);
    }

    useSocketListener(teamSocket, "update_team", (newTeamInfos) => {setTeamInfos({...teamInfosRef.current, ...newTeamInfos})});
    useSocketListener(teamSocket, "game_state", setGameState);
    useSocketListener(teamSocket, "zone", setZone);
    useSocketListener(teamSocket, "game_settings", setGameSettings);
    useSocketListener(teamSocket, "logout", logout);
    
    const value = useMemo(() => (
        {teamInfos, gameState, zoneType, zoneExtremities, nextZoneDate, gameSettings, location, getLocationAuthorization, startLocationTracking, stopLocationTracking}
    ), [teamInfos, gameState, zoneType, zoneExtremities, nextZoneDate, gameSettings, location]);

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
