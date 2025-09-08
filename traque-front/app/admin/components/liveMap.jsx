import { Fragment, useEffect, useState } from "react";
import { Arrow, CircleZone, PolygonZone, Position, Tag } from "@/components/layer";
import { CustomMapContainer, MapEventListener, MapPan } from "@/components/map";
import useAdmin from "@/hook/useAdmin";
import { GameState, ZoneTypes } from "@/util/types";
import { mapZooms } from "@/util/configurations";

export default function LiveMap({ selectedTeamId, onSelected, isFocusing, setIsFocusing, mapStyle, showZones, showNames, showArrows }) {
    const { zoneType, zoneExtremities, teams, nextZoneDate, getTeam, gameState } = useAdmin();
    const [timeLeftNextZone, setTimeLeftNextZone] = useState(null);

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
        if (!time || time < 0) return "00:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return String(minutes).padStart(2,"0") + ":" + String(seconds).padStart(2,"0");
    }

    function Zones() {
        if (!(showZones && gameState == GameState.PLAYING)) return null;

        switch (zoneType) {
            case ZoneTypes.CIRCLE:
                return (<>
                    <CircleZone circle={zoneExtremities.begin} color="red" />
                    <CircleZone circle={zoneExtremities.end} color="green" />
                </>);
            case ZoneTypes.POLYGON:
                return (<>
                    <PolygonZone polygon={zoneExtremities.begin?.polygon} color="red" />
                    <PolygonZone polygon={zoneExtremities.end?.polygon} color="green" />
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
                {teams.map((team) => team && <Fragment key={team.id}>
                    <CircleZone circle={team.startingArea} color="blue" display={gameState == GameState.PLACEMENT && showZones}>
                        <Tag text={team.name} display={showNames} />
                    </CircleZone>
                    <Arrow pos1={team.currentLocation} pos2={getTeam(team.chased)?.currentLocation} display={showArrows}/>
                    <Position position={team.currentLocation} color={"blue"} onClick={() => onSelected(team.id)} display={!team.captured}>
                        <Tag text={team.name} display={showNames} />
                    </Position>
                </Fragment>)}
            </CustomMapContainer>
        </div>
    )
}
