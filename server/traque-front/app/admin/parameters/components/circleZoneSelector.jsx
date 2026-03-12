import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { CustomMapContainer, MapEventListener } from "@/components/map";
import { NumberInput } from "@/components/input";
import useMapCircleDraw from "@/hook/useCircleDraw";
import useLocalVariable from "@/hook/useLocalVariable";
import { defaultZoneSettings } from "@/config/configurations";
import { ZoneTypes } from "@/config/types";
import { CircleZone } from "@/components/layer";
import { useAdmin } from "@/context/adminContext";
import { emitSettings } from "@/services/socket/emitters";

const EditMode = {
    MIN: 0,
    MAX: 1
};

function Drawings({ minZone, setMinZone, maxZone, setMaxZone, editMode }) {
    const { drawingCircle: drawingMaxCircle, handleLeftClick: maxLeftClick, handleRightClick: maxRightClick, handleMouseMove: maxHover } = useMapCircleDraw(maxZone, setMaxZone);
    const { drawingCircle: drawingMinCircle, handleLeftClick: minLeftClick, handleRightClick: minRightClick, handleMouseMove: minHover } = useMapCircleDraw(minZone, setMinZone);

    return (<>
        <MapEventListener
            onLeftClick={editMode == EditMode.MAX ? maxLeftClick : minLeftClick} 
            onRightClick={editMode == EditMode.MAX ? maxRightClick : minRightClick}
            onMouseMove={editMode == EditMode.MAX ? maxHover : minHover}
        />
        {
            drawingMaxCircle
            ? <CircleZone circle={drawingMaxCircle} color="blue" />
            : <CircleZone circle={maxZone} color="blue" />
        }
        {
            drawingMinCircle
            ? <CircleZone circle={drawingMinCircle} color="red" />
            : <CircleZone circle={minZone} color="red" />
        }
    </>);
}

export default function CircleZoneSelector({ display }) {
    const { settings } = useAdmin();
    const [localZoneSettings, setLocalZoneSettings, applyLocalZoneSettings] = useLocalVariable(settings.playingZones, (e) => emitSettings({...settings, playingZones: e}));
    const [localOutOfZoneDelay, setLocalOutOfZoneDelay, applyLocalOutOfZoneDelay] = useLocalVariable(settings.outOfZoneDelay, (e) => emitSettings({...settings, outOfZoneDelay: e}));
    const [editMode, setEditMode] = useState(EditMode.MAX);

    useEffect(() => {
        if (!localZoneSettings || localZoneSettings.type != ZoneTypes.CIRCLE) {
            setLocalZoneSettings(defaultZoneSettings.circle);
        }
    }, [localZoneSettings, setLocalZoneSettings]);

    function setMinZone(minZone) {
        setLocalZoneSettings({...localZoneSettings, min: minZone});
        setEditMode(EditMode.MAX);
    }

    function setMaxZone(maxZone) {
        setLocalZoneSettings({...localZoneSettings, max: maxZone});
        setEditMode(EditMode.MIN);
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

    return (
        <div className={display ? 'w-full h-full gap-3 flex flex-row' : "hidden"}>
            {localZoneSettings && localZoneSettings.type == ZoneTypes.CIRCLE && <>
                <div className="h-full flex-1">
                    <CustomMapContainer>
                        <Drawings minZone={localZoneSettings.min} setMinZone={setMinZone} maxZone={localZoneSettings.max} setMaxZone={setMaxZone} editMode={editMode} />
                    </CustomMapContainer>
                </div>
                <div className="h-full w-1/6 flex flex-col gap-3">
                    {editMode == EditMode.MAX && <button className="w-full h-16 text-lg text-white rounded bg-blue-600 hover:bg-blue-500" onClick={() => setEditMode(EditMode.MIN)}>Édition première zone</button>}
                    {editMode == EditMode.MIN && <button className="w-full h-16 text-lg text-white rounded bg-red-600 hover:bg-red-500" onClick={() => setEditMode(EditMode.MAX)}>Édition dernière zone</button>}
                    <div className="w-full flex flex-row gap-2 items-center justify-between">
                        <p>Nombre de rétrécissements</p>
                        <NumberInput id="reduction-number" value={localZoneSettings.reductionCount ?? ""} onChange={updateReductionCount} />
                    </div>
                    <div className="w-full flex flex-row gap-2 items-center justify-between">
                        <p>{"Durée d'une zone"}</p>
                        <NumberInput id="duration" value={localZoneSettings.duration ?? ""} onChange={updateDuration} />
                    </div>
                    <div className="w-full flex flex-row gap-2 items-center justify-between">
                        <p>Temps permis hors zone</p>
                        <NumberInput id="timeout-circle-selector" value={localOutOfZoneDelay ?? ""} onChange={setLocalOutOfZoneDelay} />
                    </div>
                    <button className="w-full h-16 text-lg text-white rounded bg-green-600 hover:bg-green-500" onClick={handleSubmit}>Appliquer</button>
                </div>
            </>}
        </div>
    );
}
