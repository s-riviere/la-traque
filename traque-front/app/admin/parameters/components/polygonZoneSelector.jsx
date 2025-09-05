import { useEffect, useState } from "react";
import { Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { CustomButton } from "@/components/button";
import { ReorderList } from "@/components/list";
import { CustomMapContainer, MapEventListener } from "@/components/map";
import { TextInput } from "@/components/input";
import { Node, LabeledPolygon } from "@/components/layer";
import useAdmin from "@/hook/useAdmin";
import useMapPolygonDraw from "@/hook/useMapPolygonDraw";
import useLocalVariable from "@/hook/useLocalVariable";

function Drawings({ polygons, addPolygon, removePolygon }) {
    const { currentPolygon, highlightNodes, handleLeftClick, handleRightClick, handleMouseMove } = useMapPolygonDraw(polygons, addPolygon, removePolygon);

    return (<>
        <MapEventListener onLeftClick={handleLeftClick}  onRightClick={handleRightClick} onMouseMove={handleMouseMove} />
        {polygons.map((polygon, i) => <LabeledPolygon key={i} polygon={polygon} number={i+1} />)}
        { currentPolygon.length > 0 && <>
            <Node pos={currentPolygon[0]} color={"red"} />
            <Polyline positions={currentPolygon} pathOptions={{ color: "red", weight: 3 }} />
        </>}
        {highlightNodes.map((node, i) => <Node key={i} pos={node} color={"black"} />)}
    </>);
}

export default function PolygonZoneSelector({zoneSettings, modifyZoneSettings, applyZoneSettings}) {
    const defaultDuration = 10;
    const [polygons, setPolygons] = useState([]);
    const {outOfZoneDelay, updateSettings} = useAdmin();
    const [localOutOfZoneDelay, setLocalOutOfZoneDelay, applyLocalOutOfZoneDelay] = useLocalVariable(outOfZoneDelay, (e) => updateSettings({outOfZoneDelay: e}));

    useEffect(() => {
        if (zoneSettings) {
            setPolygons(zoneSettings.polygons.map((zone) => zone.polygon));
        }
    }, [zoneSettings]);

    function idFromPolygon(polygon) {
        return (polygon[0].lat + polygon[1].lat + polygon[2].lat).toString() + (polygon[0].lng + polygon[1].lng + polygon[2].lng).toString();
    }

    function addPolygon(polygon) {
        const newPolygons = [...zoneSettings.polygons, {id: idFromPolygon(polygon), polygon: polygon, duration: defaultDuration}];
        modifyZoneSettings("polygons", newPolygons);
    }

    function removePolygon(i) {
        const newPolygons = zoneSettings.polygons.filter((_, index) => index !== i);
        modifyZoneSettings("polygons", newPolygons);
    }

    function updateDuration(i, duration) {
        const newPolygons = zoneSettings.polygons.map((zone, index) => index === i ? {id: zone.id, polygon: zone.polygon, duration: duration} : zone);
        modifyZoneSettings("polygons", newPolygons);
    }

    function handleSettingsSubmit() {
        applyZoneSettings();
        applyLocalOutOfZoneDelay();
    }
    
    return (
        <div className='h-full w-full gap-3 flex flex-row'>
            <div className="h-full flex-1">
                <CustomMapContainer>
                    <Drawings polygons={polygons} addPolygon={addPolygon} removePolygon={removePolygon} />
                </CustomMapContainer>
            </div>
            <div className="h-full w-1/6 flex flex-col gap-3">
                <div className="w-full text-center">
                    <h2 className="text-xl">Reduction order</h2>
                </div>
                <ReorderList droppableId="zones-order" array={zoneSettings.polygons} setArray={(polygons) => modifyZoneSettings("polygons", polygons)}>
                    { (zone, i) =>
                        <div className="w-full p-2 bg-white flex flex-row gap-2 items-center justify-between">
                            <p>Zone {i+1}</p>
                            <div className="w-16 h-10">
                                <TextInput value={zone?.duration || ""} onChange={(e) => updateDuration(i, parseInt(e.target.value, 10))}/>
                            </div>
                        </div>
                    }
                </ReorderList>
                <div className="w-full flex flex-row gap-2 items-center justify-between">
                    <p>Timeout</p>
                    <div className="w-16 h-10">
                        <TextInput id="timeout" value={localOutOfZoneDelay ?? ""} onChange={(e) => setLocalOutOfZoneDelay(parseInt(e.target.value, 10))} />
                    </div>
                </div>
                <div className="w-full h-15">
                    <CustomButton color="green" onClick={handleSettingsSubmit}>Apply</CustomButton>
                </div>
            </div>
        </div>
    );
}
