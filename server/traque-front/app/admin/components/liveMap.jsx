import { Fragment, useEffect, useState } from "react";
import { Arrow, CircleZone, PolygonZone, Position, Tag } from "@/components/layer";
import { CustomMapContainer, MapEventListener, MapPan } from "@/components/map";
import useAdmin from "@/hook/useAdmin";
import { GameState } from "@/util/types";
import { mapZooms } from "@/util/configurations";

export default function LiveMap({ selectedTeamId, onSelected, isFocusing, setIsFocusing, mapStyle, showZones, showNames, showArrows }) {
    const { zones, teams, getTeam, gameState } = useAdmin();
    const [timeLeftNextZone, setTimeLeftNextZone] = useState(null);
    const [isFullScreen, setIsFullScreen] = useState(false);

    useEffect(() => {
        if (zones?.zoneTransitionDate) {
            const updateTime = () => {
                setTimeLeftNextZone(Math.max(0, Math.floor((zones.zoneTransitionDate - Date.now()) / 1000)));
            };
        
            updateTime();
            const interval = setInterval(updateTime, 1000);
        
            return () => clearInterval(interval);
        }
    }, [zones?.zoneTransitionDate]);

    function formatTime(time) {
        // time is in seconds
        if (!time || time < 0) return "00:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return String(minutes).padStart(2,"0") + ":" + String(seconds).padStart(2,"0");
    }

    function Zones() {
        if (!(showZones && gameState == GameState.PLAYING)) return null;

        return (<>
            <PolygonZone polygon={zones.currentZone} color={mapStyle.currentZoneColor} />
            <PolygonZone polygon={zones.nextZone} color={mapStyle.nextZoneColor} />
        </>);
    }

    return (
        <div className={`${isFullScreen ? "fixed inset-0 z-[9999]" : "relative h-full w-full"}`}>
            <CustomMapContainer mapStyle={mapStyle}>
                {isFocusing && <MapPan center={getTeam(selectedTeamId)?.currentLocation} zoom={mapZooms.high} animate />}
                <MapEventListener onDragStart={() => setIsFocusing(false)} onWheel={() => setIsFocusing(false)} />
                <Zones/>
                {teams.map((team) => team && <Fragment key={team.id}>
                    <CircleZone circle={team.startingArea} color={mapStyle.placementZoneColor} display={gameState == GameState.PLACEMENT && showZones}>
                        <Tag text={team.name} display={showNames} />
                    </CircleZone>
                    <Arrow pos1={team.currentLocation} pos2={getTeam(team.chasing)?.currentLocation} color={mapStyle.arrowColor} display={showArrows}/>
                    <Position position={team.currentLocation} color={mapStyle.playerColor} onClick={() => onSelected(team.id)} display={!team.captured}>
                        <Tag text={team.name} display={showNames} />
                    </Position>
                </Fragment>)}
            </CustomMapContainer>
            { gameState == GameState.PLAYING &&
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none flex flex-col items-center bg-white p-2 rounded-lg shadow-lg drop-shadow">
                    <p className="text-sm">Durée zone</p>
                    <p className="text-2xl font-bold">{formatTime(timeLeftNextZone)}</p>
                </div>
            }
            <button className="absolute top-4 right-4 z-[1000] cursor-pointer bg-white p-3 rounded-full shadow-lg drop-shadow" onClick={() => setIsFullScreen(!isFullScreen)}>
                <img src={`/icons/fullscreen.png`} className="w-8 h-8" />
            </button>
        </div>
    )
}
