import { useEffect, useState } from "react";
import { Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { CustomButton } from "@/components/button";
import { ReorderList } from "@/components/list";
import { CustomMapContainer, MapEventListener } from "@/components/map";
import { TextInput } from "@/components/input";
import { Node, LabeledPolygon } from "@/components/layer";
import useAdmin from "@/hook/useAdmin";
import useMapPolygonDraw from "@/hook/usePolygonDraw";
import useLocalVariable from "@/hook/useLocalVariable";
import { defaultZoneSettings } from "@/util/configurations";
import { ZoneTypes } from "@/util/types";

function Drawings({ localZoneSettings, addZone, removeZone }) {
    const [polygons, setPolygons] = useState([]);
    const { currentPolygon, highlightNodes, handleLeftClick, handleRightClick, handleMouseMove } = useMapPolygonDraw(polygons, addZone, removeZone);

    useEffect(() => {
        if (localZoneSettings.type == ZoneTypes.POLYGON) {
            setPolygons(localZoneSettings.polygons.map(zone => zone.polygon));
        }
    }, [localZoneSettings]);

    return (<>
        <MapEventListener onLeftClick={handleLeftClick}  onRightClick={handleRightClick} onMouseMove={handleMouseMove} />
        {localZoneSettings.polygons.map((zone, i) => <LabeledPolygon key={i} polygon={zone.polygon} label={zone.id} />)}
        { currentPolygon.length > 0 && <>
            <Node pos={currentPolygon[0]} color={"red"} />
            <Polyline positions={currentPolygon} pathOptions={{ color: "red", weight: 3 }} />
        </>}
        {highlightNodes.map((node, i) => <Node key={i} pos={node} color={"black"} />)}
    </>);
}

export default function PolygonZoneSelector() {
    const defaultDuration = 10;
    const {zoneSettings, outOfZoneDelay, updateSettings} = useAdmin();
    const [localZoneSettings, setLocalZoneSettings, applyLocalZoneSettings] = useLocalVariable(zoneSettings, (e) => updateSettings({zone: e}));
    const [localOutOfZoneDelay, setLocalOutOfZoneDelay, applyLocalOutOfZoneDelay] = useLocalVariable(outOfZoneDelay, (e) => updateSettings({outOfZoneDelay: e}));

    useEffect(() => {
        if (localZoneSettings.type != ZoneTypes.POLYGON) {
            setLocalZoneSettings(defaultZoneSettings.polygon);
        }
    }, [localZoneSettings]);

    function getNewPolygonName() {
        const existingIds = new Set(localZoneSettings.polygons.map(zone => zone.id));
        for (let i = 0; i < 26; i++) {
            const letter = String.fromCharCode(65 + i);
            if (!existingIds.has(letter)) {
                return letter;
            }
        }
        return "XXX";
    }

    function setLocalZoneSettingsPolygons(polygons) {
        setLocalZoneSettings({type: localZoneSettings.type, polygons: polygons});
    }

    function addZone(polygon) {
        setLocalZoneSettingsPolygons([...localZoneSettings.polygons, {id: getNewPolygonName(), polygon: polygon, duration: defaultDuration}]);
    }

    function removeZone(i) {
        setLocalZoneSettingsPolygons(localZoneSettings.polygons.filter((_, index) => index !== i));
    }

    function updateDuration(id, duration) {
        setLocalZoneSettingsPolygons(localZoneSettings.polygons.map(zone => zone.id === id ? {...zone, duration: duration} : zone));
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
            {localZoneSettings.type == ZoneTypes.POLYGON && <>
                <div className="h-full flex-1">
                    <CustomMapContainer>
                        <Drawings localZoneSettings={localZoneSettings} addZone={addZone} removeZone={removeZone} />
                    </CustomMapContainer>
                </div>
                <div className="h-full w-1/6 flex flex-col gap-3">
                    <div className="w-full text-center">
                        <h2 className="text-xl">Reduction order</h2>
                    </div>
                    <ReorderList droppableId="zones-order" array={localZoneSettings.polygons} setArray={setLocalZoneSettingsPolygons}>
                        { (zone) =>
                            <div className="w-full p-2 bg-white flex flex-row gap-2 items-center justify-between">
                                <p>Zone {zone.id}</p>
                                <div className="w-16 h-10">
                                    <TextInput value={zone.duration || ""} onChange={(e) => updateDuration(zone.id, customStringToInt(e.target.value))}/>
                                </div>
                            </div>
                        }
                    </ReorderList>
                    <div className="w-full flex flex-row gap-2 items-center justify-between">
                        <p>Timeout</p>
                        <div className="w-16 h-10">
                            <TextInput id="timeout" value={localOutOfZoneDelay ?? ""} onChange={(e) => setLocalOutOfZoneDelay(customStringToInt(e.target.value))}/>
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
