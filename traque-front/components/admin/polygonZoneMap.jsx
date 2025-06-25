import { useEffect, useState } from "react";
import { GreenButton } from "../util/button";
import { TextInput } from "../util/textInput";
import useAdmin from "@/hook/useAdmin";
import useLocation from "@/hook/useLocation";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Polyline, Polygon, CircleMarker } from "react-leaflet";
import useMapPolygonDraw from "@/hook/useMapPolygonDraw";
import { MapPan, MapEventListener } from "./mapUtils";

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
        <div className='h-96'>
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

    useEffect(() => {
        if (zoneSettings) {
            setPolygons(zoneSettings.polygons);
            setDurations(zoneSettings.durations);
        }
    }, [zoneSettings]);

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
    }

    return (
        <div className='w-2/5 h-full gap-1 bg-white p-10 flex flex-col text-center shadow-2xl overflow-y-scroll'>
            <h2 className="text-2xl">Edit zones</h2>
            <PolygonZonePicker polygons={polygons} addPolygon={addPolygon} removePolygon={removePolygon} />
            <ul>
                {durations.map((duration, i) => (
                    <li key={i}>
                        <p>Zone {i+1}</p>
                        <TextInput value={duration} onChange={(e) => updateDuration(i, e.target.value)}/>
                    </li>
                ))}
            </ul>
            <GreenButton onClick={handleSettingsSubmit}>Apply</GreenButton>
        </div>
    );
}
