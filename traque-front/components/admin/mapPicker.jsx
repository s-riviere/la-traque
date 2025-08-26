"use client";
import { useLocation } from "@/hook/useLocation";
import { useEffect, useState, useRef, useCallback } from "react";
import "leaflet/dist/leaflet.css";
import { Circle, MapContainer, Marker, TileLayer, useMap, Tooltip, Polyline } from "react-leaflet";
import { useMapCircleDraw } from "@/hook/mapDrawing";
import useAdmin from "@/hook/useAdmin";
import { GameState } from "@/util/gameState";
import L from "leaflet";
import { createPortal } from "react-dom";
import TeamInformation from "@/components/admin/teamInformation";


function MapActionControl({ onClick, children }) {
    const map = useMap();

    useEffect(() => {
        const controlDiv = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        controlDiv.style.background = 'rgba(0,0,0,0.25)';
        controlDiv.style.borderRadius = '9999px';
        controlDiv.style.padding = '8px';
        controlDiv.style.border = 'none';
        controlDiv.title = "Plein écran";
        controlDiv.style.display = "flex";
        controlDiv.style.alignItems = "center";
        controlDiv.style.justifyContent = "center";
        controlDiv.style.width = "56px";
        controlDiv.style.height = "56px";
        controlDiv.onclick = onClick;
        controlDiv.innerHTML = `<img src="./icons/fullscreen.png" alt="" style="width:36px;height:36px;" />`;
        const customControl = L.control({ position: 'bottomleft' });
        customControl.onAdd = () => controlDiv;
        customControl.addTo(map);

        return () => {
            customControl.remove();
        };
    }, [map, onClick, children]);

    return null;
}

function LeafletSidePanel({ show, onClose, children }) {
    const map = useMap();
    const panelRef = useRef(document.createElement("div"));

    useEffect(() => {
        const panelDiv = panelRef.current;
        panelDiv.className = "leaflet-control leaflet-control-custom";


        const control = L.control({ position: "topright" });
        control.onAdd = () => panelDiv;
        if (show) control.addTo(map);

        return () => {
            control.remove();
        };
    }, [map, show]);

    if (!show) return null;

    return createPortal(
        <>
            <button
                style={{
                    position: "absolute",
                    top: "1rem",
                    right: "1rem",
                    fontSize: "3rem",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#888"
                }}
                onClick={onClose}
                title="Fermer"
            >
                ×
            </button>
            {children}
        </>,
        panelRef.current
    );
}

const positionIcon = new L.Icon({
    iconUrl: '/icons/location.png',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
    shadowSize: [30, 30],
});

function MapPan(props) {
    const map = useMap();
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (!initialized && props.center) {
            map.flyTo(props.center, props.zoom, { animate: false });
            setInitialized(true)
        }
    }, [props.center]);
    return null;
}

function MapEventListener({ onClick, onMouseMove }) {
    const map = useMap();
    useEffect(() => {
        map.on('click', onClick);
        return () => {
            map.off('click', onClick);
        }
    }, [onClick]);
    useEffect(() => {
        map.on('mousemove', onMouseMove);
        return () => {
            map.off('mousemove', onMouseMove);
        }
    });
    return null;
}

const DEFAULT_ZOOM = 14;
export function CircularAreaPicker({ area, setArea, markerPosition, ...props }) {
    const location = useLocation(Infinity);
    const { handleClick, handleMouseMove, center, radius } = useMapCircleDraw(area, setArea);
    return (
        <MapContainer  {...props} className='min-h-full w-full ' center={location} zoom={DEFAULT_ZOOM} scrollWheelZoom={true}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {center && radius && <Circle center={center} radius={radius} fillColor="blue" />}
            {markerPosition && <Marker position={markerPosition} icon={positionIcon}>
            </Marker>}
            <MapPan center={location} zoom={DEFAULT_ZOOM} />
            <MapEventListener onClick={handleClick} onMouseMove={handleMouseMove} />
        </MapContainer>)
}
export const EditMode = {
    MIN: 0,
    MAX: 1
}
export function ZonePicker({ minZone, setMinZone, maxZone, setMaxZone, editMode, ...props }) {
    const location = useLocation(Infinity);
    const { handleClick: maxClick, handleMouseMove: maxHover, center: maxCenter, radius: maxRadius } = useMapCircleDraw(minZone, setMinZone);
    const { handleClick: minClick, handleMouseMove: minHover, center: minCenter, radius: minRadius } = useMapCircleDraw(maxZone, setMaxZone);
    function handleClick(e) {
        if (editMode == EditMode.MAX) {
            maxClick(e);
        } else {
            minClick(e);
        }
    }
    function handleMouseMove(e) {
        if (editMode == EditMode.MAX) {
            maxHover(e);
        } else {
            minHover(e);
        }
    }

    return (
        <div>
            <div className='h-96'>
            <MapContainer  {...props} className='min-h-full w-full ' center={location} zoom={DEFAULT_ZOOM} scrollWheelZoom={true}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {minCenter && minRadius && <Circle center={minCenter} radius={minRadius} color="blue" fillColor="blue" />}
                {maxCenter && maxRadius && <Circle center={maxCenter} radius={maxRadius} color="red" fillColor="red" />}
                <MapPan center={location} zoom={DEFAULT_ZOOM} />
                <MapEventListener onClick={handleClick} onMouseMove={handleMouseMove} />
            </MapContainer>
        </div>
        { maxCenter && minCenter && typeof maxCenter.distanceTo === 'function' 
            && maxRadius + maxCenter.distanceTo(minCenter) >= minRadius
            && <p className="text-red-500">La zone de fin doit être incluse dans celle de départ</p>}
        </div>
        
    )
}

export function LiveMap({ selectedTeamId, setSelectedTeamId }) {
    const location = useLocation(Infinity);
    const [timeLeftNextZone, setTimeLeftNextZone] = useState(null);
    const { zone, zoneExtremities, teams, nextZoneDate, isShrinking , getTeam, gameState } = useAdmin();

    function handleMarkerClick(teamId) {
        setSelectedTeamId(teamId);
    }

    const mapWrapperRef = useRef(null);

    const handleFullscreen = useCallback(() => {
        const el = mapWrapperRef.current;
        if (!el) return;
        if (!document.fullscreenElement) {
            el.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }, []);

    // Remaining time before sending position
    useEffect(() => {
        const updateTime = () => {
            setTimeLeftNextZone(Math.max(0, Math.floor((nextZoneDate - Date.now()) / 1000)));
        };
    
        updateTime();
        const interval = setInterval(updateTime, 1000);
    
        return () => clearInterval(interval);
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
        <div className='h-full w-full' ref ={mapWrapperRef}>
            {gameState == GameState.PLAYING && <p>{`${isShrinking ? "Fin" : "Début"} du rétrécissement de la zone dans : ${formatTime(timeLeftNextZone)}`}</p>}
            <MapContainer className='min-h-full w-full' center={location} zoom={DEFAULT_ZOOM} scrollWheelZoom={true}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapPan center={location} zoom={DEFAULT_ZOOM} />
                {gameState == GameState.PLAYING && zone && <Circle center={zone.center} radius={zone.radius} color="blue" />}
                {gameState == GameState.PLAYING && zoneExtremities && <Circle center={zoneExtremities.begin.center} radius={zoneExtremities.begin.radius} color='black' fill={false} />}
                {gameState == GameState.PLAYING && zoneExtremities && <Circle center={zoneExtremities.end.center} radius={zoneExtremities.end.radius} color='red' fill={false} />}
                {teams.map((team) => team.currentLocation && !team.captured &&
                    <Marker key={team.id} position={team.currentLocation} icon={positionIcon}>
                        <Tooltip permanent direction="top" offset={[0, -5]} className="custom-tooltip">{team.name}</Tooltip>
                        <Arrow pos1={team.currentLocation} pos2={getTeam(team.chasing).currentLocation}/>
                    </Marker>
                )}
                <MapActionControl onClick={handleFullscreen}/>
            {selectedTeamId && (
                <LeafletSidePanel show={true} onClose={() => setSelectedTeamId(null)}>
                    <TeamInformation
                        selectedTeamId={selectedTeamId}
                        onClose={() => setSelectedTeamId(null)}
                    />
                </LeafletSidePanel>
            )}
            </MapContainer>
        </div>
    )
}