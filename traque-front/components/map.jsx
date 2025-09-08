import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { mapLocations, mapZooms, mapStyles } from "@/util/configurations";

export function MapPan({center, zoom, animate=false}) {
    const map = useMap();

    useEffect(() => {
        if (center && zoom) {
            map.flyTo(center, zoom, { animate: animate });
        }
    }, [center, zoom]);

    return null;
}

export function MapEventListener({ onLeftClick, onRightClick, onMouseMove, onDragStart }) {
    const map = useMap();
    // TODO use useMapEvents instead of this + detect when zoom

    // Handle the mouse click left
    useEffect(() => {
        if (!onLeftClick) return;

        let moved = false;
        let downButton = null;

        const handleMouseDown = (e) => {
            moved = false;
            downButton = e.originalEvent.button;
        };

        const handleMouseMove = () => {
            moved = true;
        };

        const handleMouseUp = (e) => {
            if (!moved) {
                if (downButton == 0) {
                    onLeftClick(e);
                }
            }
            downButton = null;
        };

        map.on('mousedown', handleMouseDown);
        map.on('mousemove', handleMouseMove);
        map.on('mouseup', handleMouseUp);

        return () => {
            map.off('mousedown', handleMouseDown);
            map.off('mousemove', handleMouseMove);
            map.off('mouseup', handleMouseUp);
        };
    }, [onLeftClick, onRightClick]);

    // Handle the right click
    useEffect(() => {
        if (!onRightClick) return;

        const handleMouseDown = (e) => {
            if (e.originalEvent.button == 2) {
                onRightClick(e);
            }
        };

        map.on('mousedown', handleMouseDown);

        return () => {
            map.off('mousedown', handleMouseDown);
        }
    }, [onRightClick]);

    // Handle the mouse move
    useEffect(() => {
        if (!onMouseMove) return;

        map.on('mousemove', onMouseMove);

        return () => {
            map.off('mousemove', onMouseMove);
        }
    }, [onMouseMove]);

    // Handle the drag start
    useEffect(() => {
        if (!onDragStart) return;

        map.on('dragstart', onDragStart);

        return () => {
            map.off('dragstart', onDragStart);
        }
    }, [onDragStart]);
    
    // Prevent right click context menu
    useEffect(() => {
        const container = map.getContainer();
        const preventContextMenu = (e) => e.preventDefault();
        container.addEventListener('contextmenu', preventContextMenu);
        return () => container.removeEventListener('contextmenu', preventContextMenu);
    }, []);

    return null;
}

function MapResizeWatcher() {
    const map = useMap();

    useEffect(() => {
        const observer = new ResizeObserver(() => {
            map.invalidateSize();
        });
        observer.observe(map.getContainer());

        return () => observer.disconnect();
    }, [map]);

    return null;
}

export function CustomMapContainer({mapStyle, children}) {
    const [location, setLocation] = useState(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            console.log('Geolocation not supported');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation([pos.coords.latitude, pos.coords.longitude]);
            },
            (err) => console.log("Error :", err),
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }, []);

    return (
        <MapContainer className='w-full h-full' center={mapLocations.paris} zoom={mapZooms.low} scrollWheelZoom={true}>
            <TileLayer url={(mapStyle || mapStyles.default).url} attribution={(mapStyle || mapStyles.default).attribution}/>
            <MapPan center={location} zoom={mapZooms.high}/>
            <MapResizeWatcher/>
            {children}
        </MapContainer>
    )
}
