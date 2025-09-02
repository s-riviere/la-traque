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

export default function CircleZoneSelector({zoneSettings, updateZoneSettings, applyZoneSettings}) {
    const {penaltySettings, changePenaltySettings} = useAdmin();
    const [allowedTimeOutOfZone, setAllowedTimeOutOfZone] = useState("");
    const [editMode, setEditMode] = useState(EditMode.MIN);

    useEffect(() => {
        setEditMode(editMode == EditMode.MIN ? EditMode.MAX : EditMode.MIN);
    }, [zoneSettings.min, zoneSettings.max])

    useEffect(() => {
        if (penaltySettings) {
            setAllowedTimeOutOfZone(penaltySettings.allowedTimeOutOfZone.toString());
        }
    }, [penaltySettings]);

    function handleSettingsSubmit() {
        console.log(zoneSettings)
        applyZoneSettings();
        changePenaltySettings({allowedTimeOutOfZone: Number(allowedTimeOutOfZone)});
    }

    return (
        <div className='h-full w-full bg-white p-3 gap-3 flex flex-row shadow-2xl'>
            <div className="h-full flex-1">
                <CustomMapContainer>
                    <Drawings minZone={zoneSettings.min} setMinZone={(e) => updateZoneSettings("min", e)} maxZone={zoneSettings.max} setMaxZone={(e) => updateZoneSettings("max", e)} editMode={editMode} />
                </CustomMapContainer>
            </div>
            <div className="h-full w-1/6 flex flex-col gap-3">
                <div className="w-full h-15">
                    {editMode == EditMode.MIN && <BlueButton onClick={() => setEditMode(EditMode.MAX)}>Click to edit first zone</BlueButton>}
                    {editMode == EditMode.MAX && <RedButton onClick={() => setEditMode(EditMode.MIN)}>Click to edit last zone</RedButton>}
                </div>
                <div className="w-full flex flex-row gap-2 items-center justify-between">
                    <p>Number</p>
                    <div className="w-16 h-10">
                        <TextInput value={zoneSettings.reductionCount} onChange={(e) => updateZoneSettings("reductionCount", e.target.value)} />
                    </div>
                </div>
                <div className="w-full flex flex-row gap-2 items-center justify-between">
                    <p>Duration</p>
                    <div className="w-16 h-10">
                        <TextInput value={zoneSettings.duration} onChange={(e) => updateZoneSettings("duration", e.target.value)} />
                    </div>
                </div>
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
