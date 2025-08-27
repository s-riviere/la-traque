import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Polygon, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { GreenButton } from "@/components/button";
import { TextInput } from "@/components/textInput";
import { MapPan, MapEventListener } from "@/components/mapUtils";
import useAdmin from "@/hook/useAdmin";
import useLocation from "@/hook/useLocation";
import useMapPolygonDraw from "@/hook/useMapPolygonDraw";

const DEFAULT_ZOOM = 14;

function PolygonDrawings({ polygons, addPolygon, removePolygon }) {
    const { currentPolygon, highlightNodes, handleLeftClick, handleRightClick, handleMouseMove } = useMapPolygonDraw(polygons, addPolygon, removePolygon);
    const nodeSize = 5; // px
    const lineThickness = 3; // px

    function DrawNode({pos, color}) {
        return (
            <CircleMarker center={pos} radius={nodeSize} pathOptions={{ color: color, fillColor: color, fillOpacity: 1 }} />
        );
    }

    function DrawLine({pos1, pos2, color}) {
        return (
            <Polyline positions={[pos1, pos2]} pathOptions={{ color: color, weight: lineThickness }} />
        );
    }

    function DrawUnfinishedPolygon({polygon}) {
        const length = polygon.length;
        if (length > 0) {
            return (
                <div>
                    <DrawNode pos={polygon[0]} color={"red"} zIndexOffset={1000} />
                    {polygon.map((_, i) => {
                        if (i < length-1) {
                            return <DrawLine key={i} pos1={polygon[i]} pos2={polygon[i+1]} color={"red"} />;
                        } else {
                            return null;
                        }
                    })}
                </div>
            );
        }
    }

    function DrawPolygon({polygon}) {
        const length = polygon.length;

        if (length > 2) {
            return (
                <Polygon positions={polygon} pathOptions={{ color: 'black', fillColor: 'black', fillOpacity: '0.5', weight: lineThickness }} />
            );
        }
    }

    return (
        <div>
            <MapEventListener onLeftClick={handleLeftClick}  onRightClick={handleRightClick} onMouseMove={handleMouseMove} />
            {polygons.map((polygon, i) => <DrawPolygon key={i} polygon={polygon} />)}
            <DrawUnfinishedPolygon polygon={currentPolygon} />
            {highlightNodes.map((node, i) => <DrawNode key={i} pos={node} color={"black"} />)}
        </div>
    );
}

function PolygonZonePicker({ polygons, addPolygon, removePolygon, ...props }) {
    const location = useLocation(Infinity);

    return (
        <div className='h-full'>
            <MapContainer {...props} className='min-h-full w-full' center={location} zoom={DEFAULT_ZOOM} scrollWheelZoom={true}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapPan center={location} zoom={DEFAULT_ZOOM} />
                <PolygonDrawings polygons={polygons} addPolygon={addPolygon} removePolygon={removePolygon} />
            </MapContainer>
        </div>
    );
}

export default function PolygonZoneMap() {
    const defaultDuration = 10;
    const [polygons, setPolygons] = useState([]);
    const [durations, setDurations] = useState([]);
    const {zoneSettings, changeZoneSettings} = useAdmin();
    const {penaltySettings, changePenaltySettings} = useAdmin();
    const [allowedTimeOutOfZone, setAllowedTimeOutOfZone] = useState("");

    useEffect(() => {
        if (zoneSettings) {
            setPolygons(zoneSettings.polygons);
            setDurations(zoneSettings.durations);
        }
        if (penaltySettings) {
            setAllowedTimeOutOfZone(penaltySettings.allowedTimeOutOfZone.toString());
        }
    }, [zoneSettings, penaltySettings]);

    function addPolygon(polygon) {
        // Polygons
        setPolygons([...polygons, polygon]);
        // Durations
        setDurations([...durations, defaultDuration]);
    }

    function removePolygon(i) {
        // Polygons
        const newPolygons = [...polygons];
        newPolygons.splice(i, 1);
        setPolygons(newPolygons);
        // Durations
        const newDurations = [...durations];
        newDurations.splice(i, 1);
        setDurations(newDurations);
    }

    function updateDuration(i, duration) {
        const newDurations = [...durations];
        newDurations[i] = duration;
        setDurations(newDurations);
    }

    function handleSettingsSubmit() {
        const newSettings = {polygons: polygons, durations: durations};
        changeZoneSettings(newSettings);
        changePenaltySettings({allowedTimeOutOfZone: Number(allowedTimeOutOfZone)});
    }
    
    return (
        <div className='h-full w-full bg-white p-3 gap-3 flex flex-row shadow-2xl'>
            <div className="h-full w-full">
                <PolygonZonePicker polygons={polygons} addPolygon={addPolygon} removePolygon={removePolygon} />
            </div>
            <div className="h-full w-1/6 flex flex-col gap-3">
                <div className="w-full text-center">
                    <h2 className="text-xl">Reduction order</h2>
                </div>
                <ul className="w-full h-full bg-gray-300">
                    {durations.map((duration, i) => (
                        <li key={i} className="w-full bg-white flex flex-row gap-2 items-center justify-between p-1">
                            <p>Zone {i+1}</p>
                            <div className="w-16 h-10">
                                <TextInput value={duration} onChange={(e) => updateDuration(i, e.target.value)}/>
                            </div>
                        </li>
                    ))}
                </ul>
                <div className="w-full flex flex-row gap-2 items-center justify-between">
                    <p>Timeout</p>
                    <div className="w-16 h-10">
                        <TextInput value={allowedTimeOutOfZone} onChange={(e) => setAllowedTimeOutOfZone(e.target.value)} />
                    </div>
                </div>
                <div className="w-full h-15">
                    <GreenButton onClick={handleSettingsSubmit}>Apply</GreenButton>
                </div>
            </div>
        </div>
    );
}
