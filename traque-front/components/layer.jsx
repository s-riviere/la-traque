import { useEffect, useState } from "react";
import { Marker, CircleMarker, Polygon, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import 'leaflet-polylinedecorator';

export function Node({pos, nodeSize = 5, color = 'black'}) {
    return (
        <CircleMarker center={pos} radius={nodeSize} pathOptions={{ color: color, fillColor: color, fillOpacity: 1 }} />
    );
}

export function LabeledPolygon({polygon, label, color = 'black', opacity = '0.5', border = 3, iconSize = 24, iconColor = 'white'}) {
    const length = polygon.length;

    if (length < 3) return null;

    const sum = polygon.reduce(
        (acc, coord) => ({
            lat: acc.lat + coord.lat,
            lng: acc.lng + coord.lng
        }),
        { lat: 0, lng: 0 }
    );

    // meanPoint can be out of the polygon
    // Idea : take the mean point of the largest connected subpolygon
    const meanPoint = {lat: sum.lat / length, lng: sum.lng / length}

    const labelIcon = L.divIcon({
        html: `<div style="
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${iconColor};
            font-weight: bold;
            font-size: ${iconSize}px;
        ">${label}</div>`,
        className: 'custom-label-icon',
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize / 2, iconSize / 2]
    });

    return (<>
        <Polygon positions={polygon} pathOptions={{ color: color, fillColor: color, fillOpacity: opacity, weight: border }} />
        <Marker position={meanPoint} icon={labelIcon} />
    </>);
}

export function Arrow({ pos1, pos2, color = 'black', weight = 5, arrowSize = 20, insetPixels = 25 }) {
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
            const newStartPoint = {
                x: point1.x + (unitX * insetPixels),
                y: point1.y + (unitY * insetPixels)
            };
            
            const newEndPoint = {
                x: point2.x - (unitX * insetPixels),
                y: point2.y - (unitY * insetPixels)
            };
            
            // Convert back to lat/lng
            const newStartLatLng = map.containerPointToLatLng(newStartPoint);
            const newEndLatLng = map.containerPointToLatLng(newEndPoint);
            
            setInsetPositions([[newStartLatLng.lat, newStartLatLng.lng], [newEndLatLng.lat, newEndLatLng.lng]]);
        };
        
        updateInsetLine();
        
        // Update when map moves or zooms
        map.on('zoom move', updateInsetLine);

        return () => map.off('zoom move', updateInsetLine);
    }, [pos1, pos2]);

    useEffect(() => {
        if (!insetPositions) return;

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
    }, [insetPositions])

    return null;
}
