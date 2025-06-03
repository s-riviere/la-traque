'use client';
import React, { useEffect, useState } from 'react'
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import "leaflet-defaulticon-compatibility";
import "leaflet/dist/leaflet.css";
import useGame from '@/hook/useGame';
import { useTeamContext } from '@/context/teamContext';

const DEFAULT_ZOOM = 14;


// Pan to the center of the map when the position of the user is updated for the first time
function MapPan(props) {
    const map = useMap();
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (!initialized && props.center) {
            map.flyTo(props.center, DEFAULT_ZOOM, { animate: false });
            setInitialized(true)
        }
    }, [props.center]);

    return null;
}

function LiveZone() {
    const { zone } = useTeamContext();
    console.log('Zone', zone);
    return zone && <Circle center={zone.center} radius={zone.radius} color='blue' fill={false} />
}

function ZoneExtremities() {
    const { zoneExtremities } = useTeamContext();
    console.log('Zone extremities', zoneExtremities);
    return zoneExtremities?.begin && zoneExtremities?.end && <>
        {/* <Circle center={zoneExtremities.begin.center} radius={zoneExtremities.begin.radius} color='black' fill={false} /> */}
        <Circle center={zoneExtremities.end.center} radius={zoneExtremities.end.radius} color='red' fill={false} />
    </>

}

export function LiveMap({ ...props }) {
    const { currentPosition, enemyPosition } = useGame();
    useEffect(() => {
        console.log('Current position', currentPosition);
    }, [currentPosition]);
    return (
        <MapContainer  {...props} className='min-h-full z-0' center={[0, 0]} zoom={0} scrollWheelZoom={true}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {currentPosition && <Marker position={currentPosition} icon={new L.Icon({
                iconUrl: '/icons/location.png',
                iconSize: [30, 30],
                iconAnchor: [15, 15],
                popupAnchor: [0, -15],
                shadowSize: [30, 30],
            })}>
                <Popup>
                    Votre position
                </Popup>
            </Marker>}
            {enemyPosition && <Marker position={enemyPosition} icon={new L.Icon({
                iconUrl: '/icons/target.png',
                iconSize: [30, 30],
                iconAnchor: [15, 15],
                popupAnchor: [0, -15],
                shadowSize: [30, 30],
            })}>
                <Popup>
                    Position de l&apos;ennemi
                </Popup>
            </Marker>}
            <MapPan center={currentPosition} />
            <LiveZone />
            <ZoneExtremities />
        </MapContainer>
    )
}

export function PlacementMap({ ...props }) {
    const { currentPosition, startingArea } = useGame();
    return (
        <MapContainer  {...props} className='min-h-full w-full z-0' center={[0, 0]} zoom={0} scrollWheelZoom={true}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {currentPosition && <Marker position={currentPosition} icon={new L.Icon({
                iconUrl: '/icons/location.png',
                iconSize: [30, 30],
                iconAnchor: [15, 15],
                popupAnchor: [0, -15],
                shadowSize: [30, 30],
            })}>
                <Popup>
                    Votre position
                </Popup>
            </Marker>}
            <MapPan center={currentPosition} />
            {startingArea && <Circle center={startingArea?.center} radius={startingArea?.radius} color='blue' />}
        </MapContainer>
    )
}
