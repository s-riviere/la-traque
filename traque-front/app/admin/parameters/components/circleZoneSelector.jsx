import { useEffect, useState } from "react";
import { Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { CustomButton } from "@/components/button";
import { CustomMapContainer, MapEventListener } from "@/components/map";
import { TextInput } from "@/components/input";
import useAdmin from "@/hook/useAdmin";
import useMapCircleDraw from "@/hook/useCircleDraw";
import useLocalVariable from "@/hook/useLocalVariable";
import { defaultZoneSettings } from "@/util/configurations";
import { ZoneTypes } from "@/util/types";

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

export default function CircleZoneSelector() {
    const {zoneSettings, outOfZoneDelay, updateSettings} = useAdmin();
    const [localZoneSettings, setLocalZoneSettings, applyLocalZoneSettings] = useLocalVariable(zoneSettings, (e) => updateSettings({zone: e}));
    const [localOutOfZoneDelay, setLocalOutOfZoneDelay, applyLocalOutOfZoneDelay] = useLocalVariable(outOfZoneDelay, (e) => updateSettings({outOfZoneDelay: e}));
    const [editMode, setEditMode] = useState(EditMode.MIN);

    useEffect(() => {
        if (localZoneSettings.type != ZoneTypes.CIRCLE) {
            setLocalZoneSettings(defaultZoneSettings.circle);
        }
    }, [localZoneSettings]);

    useEffect(() => {
        setEditMode(editMode == EditMode.MIN ? EditMode.MAX : EditMode.MIN);
    }, [localZoneSettings.min, localZoneSettings.max]);

    function setMinZone(minZone) {
        setLocalZoneSettings({...localZoneSettings, min: minZone});
    }

    function setMaxZone(maxZone) {
        setLocalZoneSettings({...localZoneSettings, max: maxZone});
    }

    function updateReductionCount(reductionCount) {
        setLocalZoneSettings({...localZoneSettings, reductionCount: reductionCount});
    }

    function updateDuration(duration) {
        setLocalZoneSettings({...localZoneSettings, duration: duration});
    }

    function handleSubmit() {
        applyLocalZoneSettings();
        applyLocalOutOfZoneDelay();
    }

    function customStringToInt(e) {
        return parseInt(e, 10) || null;
    }

    return (
        <div className='h-full w-full gap-3 flex flex-row'>
            {localZoneSettings.type == ZoneTypes.CIRCLE && <>
                <div className="h-full flex-1">
                    <CustomMapContainer>
                        <Drawings minZone={localZoneSettings.min} setMinZone={setMinZone} maxZone={localZoneSettings.max} setMaxZone={setMaxZone} editMode={editMode} />
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
                            <TextInput id="reduction-number" value={localZoneSettings.reductionCount ?? ""} onChange={(e) => updateReductionCount(customStringToInt(e.target.value))} />
                        </div>
                    </div>
                    <div className="w-full flex flex-row gap-2 items-center justify-between">
                        <p>Zone duration</p>
                        <div className="w-16 h-10">
                            <TextInput id="duration" value={localZoneSettings.duration ?? ""} onChange={(e) => updateDuration(customStringToInt(e.target.value))} />
                        </div>
                    </div>
                    <div className="w-full flex flex-row gap-2 items-center justify-between">
                        <p>Timeout</p>
                        <div className="w-16 h-10">
                            <TextInput id="timeout" value={localOutOfZoneDelay ?? ""} onChange={(e) => setLocalOutOfZoneDelay(customStringToInt(e.target.value))} />
                        </div>
                    </div>
                    <div className="w-full h-15">
                        <CustomButton color="green" onClick={handleSubmit}>Apply</CustomButton>
                    </div>
                </div>
            </>}
        </div>
    );
}
