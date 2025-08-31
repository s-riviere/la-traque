import { useEffect, useState } from "react";
import { Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { BlueButton, GreenButton, RedButton } from "@/components/button";
import { CustomMapContainer, MapEventListener } from "@/components/map";
import { TextInput } from "@/components/input";
import useAdmin from "@/hook/useAdmin";
import useMapCircleDraw from "@/hook/useMapCircleDraw";

const EditMode = {
    MIN: 0,
    MAX: 1
}

function Drawings({ minZone, setMinZone, maxZone, setMaxZone, editMode }) {
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
            <MapEventListener onLeftClick={handleLeftClick}  onRightClick={handleRightClick} onMouseMove={handleMouseMove}/>
            {minCenter && minRadius && <Circle center={minCenter} radius={minRadius} color="blue" fillColor="blue" />}
            {maxCenter && maxRadius && <Circle center={maxCenter} radius={maxRadius} color="red" fillColor="red" />}
        </div>
    );
}

export default function CircleZoneSelector() {
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

    // When the user set one zone, switch to the other
    useEffect(() => {
        if(editMode == EditMode.MIN) {
            setEditMode(EditMode.MAX);
        } else {
            setEditMode(EditMode.MIN);
        }

    }, [minZone, maxZone]);

    function handleSettingsSubmit() {
        const newSettings = {min:minZone, max:maxZone, reductionCount: Number(reductionCount), duration: Number(duration)};
        changeZoneSettings(newSettings);
    }

    return (
        <div className='w-2/5 h-full gap-1 bg-white p-10 flex flex-col text-center shadow-2xl overflow-y-scroll'>
            <h2 className="text-2xl">Edit zones</h2>
            {editMode == EditMode.MIN && <BlueButton onClick={() => setEditMode(EditMode.MAX)}>Click to edit first zone</BlueButton>}
            {editMode == EditMode.MAX && <RedButton onClick={() => setEditMode(EditMode.MIN)}>Click to edit last zone</RedButton>}
            <CustomMapContainer>
                <Drawings minZone={minZone} maxZone={maxZone} editMode={editMode} setMinZone={setMinZone} setMaxZone={setMaxZone} />
            </CustomMapContainer>
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
