import { useEffect, useState } from "react";
import { Circle, MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { BlueButton, GreenButton, RedButton } from "@/components/button";
import { TextInput } from "@/components/textInput";
import { MapPan, MapEventListener } from "@/components/mapUtils";
import useAdmin from "@/hook/useAdmin";
import useLocation from "@/hook/useLocation";
import useMapCircleDraw from "@/hook/useMapCircleDraw";

const DEFAULT_ZOOM = 14;
const EditMode = {
    MIN: 0,
    MAX: 1
}

function CircleDrawings({ minZone, setMinZone, maxZone, setMaxZone, editMode }) {
    const { center: maxCenter, radius: maxRadius, handleLeftClick: maxLeftClick, handleRightClick: maxRightClick, handleMouseMove: maxHover } = useMapCircleDraw(maxZone, setMaxZone);
    const { center: minCenter, radius: minRadius, handleLeftClick: minLeftClick, handleRightClick: minRightClick, handleMouseMove: minHover } = useMapCircleDraw(minZone, setMinZone);
    
    function handleLeftClick(e) {
        if (editMode == EditMode.MAX) {
            maxLeftClick(e);
        } else {
            minLeftClick(e);
        }
    }
    
    function handleRightClick(e) {
        if (editMode == EditMode.MAX) {
            maxRightClick(e);
        } else {
            minRightClick(e);
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
            {minCenter && minRadius && <Circle center={minCenter} radius={minRadius} color="blue" fillColor="blue" />}
            {maxCenter && maxRadius && <Circle center={maxCenter} radius={maxRadius} color="red" fillColor="red" />}
            <MapEventListener onLeftClick={handleLeftClick}  onRightClick={handleRightClick} onMouseMove={handleMouseMove} />
        </div>
    );
}

export function CircleZonePicker({ minZone, maxZone, editMode, setMinZone, setMaxZone, ...props }) {
    const location = useLocation(Infinity);

    return (
        <div className='h-96'>
            <MapContainer {...props} className='min-h-full w-full' center={location} zoom={DEFAULT_ZOOM} scrollWheelZoom={true}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapPan center={location} zoom={DEFAULT_ZOOM} />
                <CircleDrawings minZone={minZone} maxZone={maxZone} editMode={editMode} setMinZone={setMinZone} setMaxZone={setMaxZone} />
            </MapContainer>
        </div>
    );
}

export default function CircleZoneMap() {
    const [editMode, setEditMode] = useState(EditMode.MIN);
    const [minZone, setMinZone] = useState(null);
    const [maxZone, setMaxZone] = useState(null);
    const [reductionCount, setReductionCount] = useState("");
    const [duration, setDuration] = useState("");
    const {zoneSettings, changeZoneSettings} = useAdmin();

    useEffect(() => {
        if (zoneSettings) {
            setMinZone(zoneSettings.min);
            setMaxZone(zoneSettings.max);
            setReductionCount(zoneSettings.reductionCount.toString());
            setDuration(zoneSettings.duration.toString());
        }
    }, [zoneSettings]);

    function handleSettingsSubmit() {
        const newSettings = {min:minZone, max:maxZone, reductionCount: Number(reductionCount), duration: Number(duration)};
        changeZoneSettings(newSettings);
    }

    // When the user set one zone, switch to the other
    useEffect(() => {
        if(editMode == EditMode.MIN) {
            setEditMode(EditMode.MAX);
        } else {
            setEditMode(EditMode.MIN);
        }

    }, [minZone, maxZone]);

    return (
        <div className='w-2/5 h-full gap-1 bg-white p-10 flex flex-col text-center shadow-2xl overflow-y-scroll'>
            <h2 className="text-2xl">Edit zones</h2>
            {editMode == EditMode.MIN && <BlueButton onClick={() => setEditMode(EditMode.MAX)}>Click to edit first zone</BlueButton>}
            {editMode == EditMode.MAX && <RedButton onClick={() => setEditMode(EditMode.MIN)}>Click to edit last zone</RedButton>}
            <CircleZonePicker minZone={minZone} maxZone={maxZone} editMode={editMode} setMinZone={setMinZone} setMaxZone={setMaxZone} />
            <div>
                <p>Number of zones</p>
                <TextInput value={reductionCount} onChange={(e) => setReductionCount(e.target.value)}></TextInput>
            </div>
            <div>
                <p>Duration of a zone</p>
                <TextInput value={duration} onChange={(e) => setDuration(e.target.value)}></TextInput>
            </div>
            <GreenButton onClick={handleSettingsSubmit}>Apply</GreenButton>
        </div>
    );
}
