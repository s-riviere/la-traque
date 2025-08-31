import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_ZOOM = 14;

const mapStyles = {
    default: {
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    },
    satellite: {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: 'Tiles &copy; Esri'
    },
}

export function MapPan({center, zoom}) {
    const map = useMap();

    useEffect(() => {
        if (center, zoom) {
            map.flyTo(center, zoom, { animate: false });
        }
    }, [center, zoom]);

    return null;
}

export function MapEventListener({ onLeftClick, onRightClick, onMouseMove }) {
    const map = useMap();

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
    
    // Prevent right click context menu
    useEffect(() => {
        const container = map.getContainer();
        const preventContextMenu = (e) => e.preventDefault();
        container.addEventListener('contextmenu', preventContextMenu);
        return () => container.removeEventListener('contextmenu', preventContextMenu);
    }, []);

    return null;
}

export function CustomMapContainer({mapStyle, children}) {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!navigator.geolocation) {
            console.log('Geolocation not supported');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation([pos.coords.latitude, pos.coords.longitude]);
                setLoading(false);
            },
            (err) => console.log("Error :", err),
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }, []);

    if (loading) {
        return <div className="w-full h-full"/>
    }

    return (
        <MapContainer className='w-full h-full' center={location} zoom={DEFAULT_ZOOM} scrollWheelZoom={true}>
            <TileLayer url={(mapStyle || mapStyles.default).url} attribution={(mapStyle || mapStyles.default).attribution}/>
            {children}
        </MapContainer>
    )
}
