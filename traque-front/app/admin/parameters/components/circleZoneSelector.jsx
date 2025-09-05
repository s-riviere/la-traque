import { useEffect, useState } from "react";
import { Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { CustomButton } from "@/components/button";
import { CustomMapContainer, MapEventListener } from "@/components/map";
import { TextInput } from "@/components/input";
import useAdmin from "@/hook/useAdmin";
import useMapCircleDraw from "@/hook/useMapCircleDraw";
import useLocalVariable from "@/hook/useLocalVariable";

const EditMode = {
    MIN: 0,
    MAX: 1
}

function Drawings({ minZone, setMinZone, maxZone, setMaxZone, editMode }) {
    const { center: maxCenter, radius: maxRadius, handleLeftClick: maxLeftClick, handleRightClick: maxRightClick, handleMouseMove: maxHover } = useMapCircleDraw(maxZone, setMaxZone);
    const { center: minCenter, radius: minRadius, handleLeftClick: minLeftClick, handleRightClick: minRightClick, handleMouseMove: minHover } = useMapCircleDraw(minZone, setMinZone);

    return (<>
        <MapEventListener
            onLeftClick={editMode == EditMode.MAX ? maxLeftClick : minLeftClick} 
            onRightClick={editMode == EditMode.MAX ? maxRightClick : minRightClick}
            onMouseMove={editMode == EditMode.MAX ? maxHover : minHover}
        />
        {minCenter && minRadius && <Circle center={minCenter} radius={minRadius} color="red" fillColor="red" />}
        {maxCenter && maxRadius && <Circle center={maxCenter} radius={maxRadius} color="blue" fillColor="blue" />}
    </>);
}

export default function CircleZoneSelector({zoneSettings, modifyZoneSettings, applyZoneSettings}) {
    const {outOfZoneDelay, updateSettings} = useAdmin();
    const [localOutOfZoneDelay, setLocalOutOfZoneDelay, applyLocalOutOfZoneDelay] = useLocalVariable(outOfZoneDelay, (e) => updateSettings({outOfZoneDelay: e}));
    const [editMode, setEditMode] = useState(EditMode.MIN);

    useEffect(() => {
        setEditMode(editMode == EditMode.MIN ? EditMode.MAX : EditMode.MIN);
    }, [zoneSettings.min, zoneSettings.max]);

    function handleSettingsSubmit() {
        applyZoneSettings();
        applyLocalOutOfZoneDelay();
    }

    function customStringToInt(e) {
        return parseInt(e, 10) || null;
    }

    return (
        <div className='h-full w-full gap-3 flex flex-row'>
            <div className="h-full flex-1">
                <CustomMapContainer>
                    <Drawings minZone={zoneSettings.min} setMinZone={(e) => modifyZoneSettings("min", e)} maxZone={zoneSettings.max} setMaxZone={(e) => modifyZoneSettings("max", e)} editMode={editMode} />
                </CustomMapContainer>
            </div>
            <div className="h-full w-1/6 flex flex-col gap-3">
                <div className="w-full h-15">
                    {editMode == EditMode.MIN && <CustomButton color="blue" onClick={() => setEditMode(EditMode.MAX)}>Click to edit first zone</CustomButton>}
                    {editMode == EditMode.MAX && <CustomButton color="red" onClick={() => setEditMode(EditMode.MIN)}>Click to edit last zone</CustomButton>}
                </div>
                <div className="w-full flex flex-row gap-2 items-center justify-between">
                    <p>Reduction number</p>
                    <div className="w-16 h-10">
                        <TextInput id="reduction-number" value={zoneSettings?.reductionCount ?? ""} onChange={(e) => modifyZoneSettings("reductionCount", customStringToInt(e.target.value))} />
                    </div>
                </div>
                <div className="w-full flex flex-row gap-2 items-center justify-between">
                    <p>Zone duration</p>
                    <div className="w-16 h-10">
                        <TextInput id="duration" value={zoneSettings?.duration ?? ""} onChange={(e) => modifyZoneSettings("duration", customStringToInt(e.target.value))} />
                    </div>
                </div>
                <div className="w-full flex flex-row gap-2 items-center justify-between">
                    <p>Timeout</p>
                    <div className="w-16 h-10">
                        <TextInput id="timeout" value={localOutOfZoneDelay ?? ""} onChange={(e) => setLocalOutOfZoneDelay(customStringToInt(e.target.value))} />
                    </div>
                </div>
                <div className="w-full h-15">
                    <CustomButton color="green" onClick={handleSettingsSubmit}>Apply</CustomButton>
                </div>
            </div>
        </div>
    );
}
