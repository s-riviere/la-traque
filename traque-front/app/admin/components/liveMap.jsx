import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, Tooltip, Polyline, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapPan } from "@/components/mapUtils";
import useLocation from "@/hook/useLocation";
import useAdmin from "@/hook/useAdmin";
import { GameState } from "@/util/gameState";

const DEFAULT_ZOOM = 14;

const positionIcon = new L.Icon({
    iconUrl: '/icons/marker/blue.png',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
    shadowSize: [30, 30],
});

export default function LiveMap({mapStyle, showZones, showNames, showArrows}) {
    const location = useLocation(Infinity);
    const [timeLeftNextZone, setTimeLeftNextZone] = useState(null);
    const { zoneExtremities, teams, nextZoneDate, getTeam, gameState } = useAdmin();

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

    function Arrow({pos1, pos2}) {
        if (pos1 && pos2) {
            return (
                <Polyline positions={[pos1, pos2]} pathOptions={{ color: 'black', weight: 3 }}/>
            )
        } else {
            return null;
        }
    }

    return (
        <div className='h-full w-full flex flex-col'>
            {gameState == GameState.PLAYING && <p>{`Next zone in : ${formatTime(timeLeftNextZone)}`}</p>}
            <MapContainer className='flex-1 w-full' center={location} zoom={DEFAULT_ZOOM} scrollWheelZoom={true}>
                <TileLayer url={mapStyle.url} attribution={mapStyle.attribution}/>
                <MapPan center={location} zoom={DEFAULT_ZOOM} />
                {showZones && gameState == GameState.PLAYING && zoneExtremities.begin && <Polygon positions={zoneExtremities.begin.points} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: '0.1', weight: 3 }} />}
                {showZones && gameState == GameState.PLAYING && zoneExtremities.end && <Polygon positions={zoneExtremities.end.points} pathOptions={{ color: 'green', fillColor: 'green', fillOpacity: '0.1', weight: 3 }} />}
                {teams.map((team) => team.currentLocation && !team.captured &&
                    <Marker key={team.id} position={team.currentLocation} icon={positionIcon}>
                        {showNames && <Tooltip permanent direction="top" offset={[0.5, -15]} className="custom-tooltip">{team.name}</Tooltip>}
                        {showArrows && <Arrow pos1={team.currentLocation} pos2={getTeam(team.chasing).currentLocation}/>}
                    </Marker>
                )}
            </MapContainer>
        </div>
    )
}
