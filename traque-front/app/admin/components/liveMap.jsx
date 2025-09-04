import { useEffect, useState } from "react";
import { Marker, Tooltip, Polygon, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import 'leaflet-polylinedecorator';
import { Arrow } from "@/components/layer";
import { CustomMapContainer, MapEventListener, MapPan } from "@/components/map";
import useAdmin from "@/hook/useAdmin";
import { GameState, ZoneTypes } from "@/util/types";
import { mapZooms } from "@/util/configurations";

const positionIcon = new L.Icon({
    iconUrl: '/icons/marker/blue.png',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
    shadowSize: [30, 30],
});

export default function LiveMap({ selectedTeamId, onSelected, isFocusing, setIsFocusing, mapStyle, showZones, showNames, showArrows}) {
    const { zoneType, zoneExtremities, teams, nextZoneDate, getTeam, gameState } = useAdmin();
    const [timeLeftNextZone, setTimeLeftNextZone] = useState(null);

    // Remaining time before sending position
    useEffect(() => {
        if (nextZoneDate) {
            const updateTime = () => {
                setTimeLeftNextZone(Math.max(0, Math.floor((nextZoneDate - Date.now()) / 1000)));
            };
        
            updateTime();
            const interval = setInterval(updateTime, 1000);
        
            return () => clearInterval(interval);
        }
    }, [nextZoneDate]);

    function formatTime(time) {
        // time is in seconds
        if (time < 0) return "00:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return String(minutes).padStart(2,"0") + ":" + String(seconds).padStart(2,"0");
    }

    function Zones() {
        if (!(showZones && gameState == GameState.PLAYING && zoneType)) return null;

        switch (zoneType) {
            case ZoneTypes.CIRCLE:
                return (<>
                    { zoneExtremities.begin && <Circle center={zoneExtremities.begin.center} radius={zoneExtremities.begin.radius} color="red" fillColor="red" />}
                    { zoneExtremities.end && <Circle center={zoneExtremities.end.center} radius={zoneExtremities.end.radius} color="green" fillColor="green" />}
                </>);
            case ZoneTypes.POLYGON:
                return (<>
                    { zoneExtremities.begin && <Polygon positions={zoneExtremities.begin.points} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: '0.1', weight: 3 }} />}
                    { zoneExtremities.end && <Polygon positions={zoneExtremities.end.points} pathOptions={{ color: 'green', fillColor: 'green', fillOpacity: '0.1', weight: 3 }} />}
                </>);
            default:
                return null;
        }
    }

    return (
        <div className='h-full w-full flex flex-col'>
            {gameState == GameState.PLAYING && <p>{`Next zone in : ${formatTime(timeLeftNextZone)}`}</p>}
            <CustomMapContainer mapStyle={mapStyle}>
                {isFocusing && <MapPan center={getTeam(selectedTeamId)?.currentLocation} zoom={mapZooms.high} animate />}
                <MapEventListener onDragStart={() => setIsFocusing(false)}/>
                <Zones/>
                {teams.map((team) => team.currentLocation && !team.captured && <>
                    <Marker key={team.id} position={team.currentLocation} icon={positionIcon} eventHandlers={{click: () => onSelected(team.id)}}>
                        {showNames && <Tooltip permanent direction="top" offset={[0.5, -15]} className="custom-tooltip">{team.name}</Tooltip>}
                    </Marker>
                    {showArrows && <Arrow key={team.id} pos1={team.currentLocation} pos2={getTeam(team.chased).currentLocation}/>}
                </>)}
            </CustomMapContainer>
        </div>
    )
}
