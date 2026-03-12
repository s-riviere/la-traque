import { useEffect, useState } from "react";
import { Marker, Tooltip, CircleMarker, Circle, Polygon, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import 'leaflet-polylinedecorator';

export function Node({position, color = 'black', display = true}) {
    const nodeSize = 5;
    const fillOpacity = 1;

    return (
        display && position && <CircleMarker center={position} radius={nodeSize} pathOptions={{ color: color, fillColor: color, fillOpacity: fillOpacity }} />
    );
}

export function Label({position, label = "", color = "black", display = true}) {
    const size = 24;

    const labelIcon = L.divIcon({
        html: `<div style="
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${color};
            font-weight: bold;
            font-size: ${size}px;
        ">${label}</div>`,
        className: 'custom-label-icon',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
    });

    return (
        display && position && <Marker position={position} icon={labelIcon} />
    );
}

export function Tag({text = "", display = true}) {
    return (
        display && <Tooltip permanent direction="top" offset={[0.5, -15]} opacity={1} className="custom-tooltip">{text}</Tooltip>
    );
}

export function CircleZone({circle, color = "black", display = true, children = null}) {
    const opacity = 0.1;
    const border = 3;

    return (
        display && circle && 
        <Circle center={circle.center} radius={circle.radius}  pathOptions={{ color: color, fillColor: color, fillOpacity: opacity, weight: border }}>
            {children}
        </Circle>
    );
}

export function PolygonZone({polygon, color = "black", display = true, children = null}) {
    const opacity = 0.1;
    const border = 3;

    return (
        display && polygon && polygon.length >= 3 &&
        <Polygon positions={polygon} pathOptions={{ color: color, fillColor: color, fillOpacity: opacity, weight: border }}>
            {children}
        </Polygon>
    );
}

export function Position({position, color = "blue", onClick = () => {}, display = true, children = null}) {

    const positionIcon = new L.Icon({
        iconUrl: `/icons/marker/${color}.png`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15],
        shadowSize: [30, 30],
    });

    return (
        display && position &&
        <Marker position={position} icon={positionIcon} eventHandlers={{click: onClick}}>
            {children}
        </Marker>
    );
}

export function Arrow({ pos1, pos2, color = 'black', display = true }) {
    const weight = 5;
    const arrowSize = 20;
    const insetPixels = 25;
    const map = useMap();
    const [insetPositions, setInsetPositions] = useState(null);
    
    useEffect(() => {
        const updateInsetLine = () => {
            if (!pos1 || !pos2) {
                setInsetPositions(null);
                return;
            }
            
            // Convert lat/lng to screen coordinates
            const point1 = map.latLngToContainerPoint(pos1);
            const point2 = map.latLngToContainerPoint(pos2);
            
            // Calculate direction vector
            const dx = point2.x - point1.x;
            const dy = point2.y - point1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If the points are too close, do not render
            if (distance <= 2*insetPixels) {
                setInsetPositions(null);
                return;
            }
            
            // Normalize direction vector
            const unitX = dx / distance;
            const unitY = dy / distance;
            
            // Calculate new start and end points in screen coordinates
            const newStartPoint = L.point(
                point1.x + (unitX * insetPixels),
                point1.y + (unitY * insetPixels)
            );
            
            const newEndPoint = L.point(
                point2.x - (unitX * insetPixels),
                point2.y - (unitY * insetPixels)
            );
            
            // Convert back to lat/lng
            const newStartLatLng = map.containerPointToLatLng(newStartPoint);
            const newEndLatLng = map.containerPointToLatLng(newEndPoint);
            
            setInsetPositions([[newStartLatLng.lat, newStartLatLng.lng], [newEndLatLng.lat, newEndLatLng.lng]]);
        };
        
        updateInsetLine();
        
        // Update when map moves or zooms
        map.on('zoom move', updateInsetLine);

        return () => {
            map.off('zoom move', updateInsetLine);
        };
    }, [map, pos1, pos2]);

    useEffect(() => {
        if (!display || !insetPositions) return;

        // Create the base polyline
        const polyline = L.polyline(insetPositions, {
            color: color,
            weight: weight
        }).addTo(map);
        
        // Create the arrow decorator
        const decorator = L.polylineDecorator(polyline, {
            patterns: [{
                offset: '100%',
                repeat: 0,
                symbol: L.Symbol.arrowHead({
                    pixelSize: arrowSize,
                    polygon: false,
                    pathOptions: { 
                        stroke: true, 
                        weight: weight, 
                        color: color 
                    }
                })
            }]
        }).addTo(map);

        // Cleanup function
        return () => {
            map.removeLayer(polyline);
            map.removeLayer(decorator);
        };
    }, [color, display, insetPositions, map]);

    return null;
}
