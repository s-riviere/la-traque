"use client";
import { useLocation } from "@/hook/useLocation";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useMapCircleDraw } from "@/hook/mapDrawing";
import useAdmin from "@/hook/useAdmin";

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

const DEFAULT_ZOOM = 17;
export function CircularAreaPicker({ area, setArea, markerPosition, ...props }) {
    const location = useLocation(Infinity);
    const { handleClick, handleMouseMove, center, radius } = useMapCircleDraw(area, setArea);
    return (
        <MapContainer  {...props} className='min-h-full w-full ' center={[48.7143326, 2.20564757]} zoom={14} scrollWheelZoom={true}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {center && radius && <Circle center={center} radius={radius} fillColor="blue" />}
            {markerPosition && <Marker position={markerPosition} icon={new L.Icon({
                iconUrl: '/icons/location.png',
                iconSize: [41, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            })}></Marker>}
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
            <MapContainer  {...props} className='min-h-full w-full ' center={[48.7143326, 2.20564757]} zoom={14} scrollWheelZoom={true}>
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

export function LiveMap() {
    const location = useLocation(Infinity);
    const [timeLeftNextZone, setTimeLeftNextZone] = useState(null);
    const { zone, zoneExtremities, teams, getTeamName, nextZoneDate, isShrinking } = useAdmin();

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

    return (
        <div className='min-h-full w-full'>
            <p>{`${isShrinking ? "Fin" : "Début"} du rétrécissement de la zone dans : ${formatTime(timeLeftNextZone)}`}</p>
            <MapContainer className='min-h-full w-full' center={location} zoom={DEFAULT_ZOOM} scrollWheelZoom={true}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapPan center={location} zoom={DEFAULT_ZOOM} />
                {zone && <Circle center={zone.center} radius={zone.radius} color="blue" />}
                {zoneExtremities && <Circle center={zoneExtremities.begin.center} radius={zoneExtremities.begin.radius} color='black' fill={false} />}
                {zoneExtremities && <Circle center={zoneExtremities.end.center} radius={zoneExtremities.end.radius} color='red' fill={false} />}
                {teams.map((team) => team.currentLocation && !team.captured && <Marker key={team.id} position={team.currentLocation} icon={new L.Icon({
                    iconUrl: '/icons/location.png',
                    iconSize: [41, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })}>
                    <Popup>
                        <strong className="text-lg">{team.name}</strong>
                        <p className="text-md">Chasing : {getTeamName(team.chasing)}</p>
                        <p className="text-md">Chased by : {getTeamName(team.chased)}</p>
                    </Popup>
                </Marker>)}
            </MapContainer>
        </div>
    )
}