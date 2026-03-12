import { useEffect, useMemo } from "react";
import { Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ReorderList } from "@/components/list";
import { CustomMapContainer, MapEventListener } from "@/components/map";
import { NumberInput } from "@/components/input";
import { Node, PolygonZone, Label } from "@/components/layer";
import useMapPolygonDraw from "@/hook/usePolygonDraw";
import useLocalVariable from "@/hook/useLocalVariable";
import { defaultZoneSettings } from "@/config/configurations";
import { ZoneTypes } from "@/config/types";
import { emitSettings } from "@/services/socket/emitters";
import { useAdmin } from "@/context/adminContext";

function Drawings({ localZoneSettings, addZone, removeZone }) {
    const polygons = useMemo(() => {
        return localZoneSettings.type == ZoneTypes.POLYGON ? localZoneSettings.polygons.map(zone => zone.polygon) : [];
    }, [localZoneSettings]);

    const { currentPolygon, highlightNodes, handleLeftClick, handleRightClick, handleMouseMove } = useMapPolygonDraw(polygons, addZone, removeZone);

    function getLabelPosition(polygon) {
        const sum = polygon.reduce(
            (acc, coord) => ({
                lat: acc.lat + coord.lat,
                lng: acc.lng + coord.lng
            }),
            { lat: 0, lng: 0 }
        );

        // The calculated mean point can be out of the polygon
        // Idea : take the mean point of the largest convex subpolygon
        return {lat: sum.lat / polygon.length, lng: sum.lng / polygon.length};
    }

    return (<>
        <MapEventListener onLeftClick={handleLeftClick}  onRightClick={handleRightClick} onMouseMove={handleMouseMove} />
        {localZoneSettings.polygons.map(zone =>
            <PolygonZone key={zone.id} polygon={zone.polygon} color="black" >
                <Label position={getLabelPosition(zone.polygon)} label={zone.id} color="white" />
            </PolygonZone>
        )}
        { currentPolygon.length > 0 && <>
            <Polyline positions={currentPolygon} pathOptions={{ color: "red", weight: 3 }} />
            <Node position={currentPolygon[0]} color="red" />
        </>}
        {highlightNodes.map((node, i) =>
            <Node key={i} position={node} color="black" />
        )}
    </>);
}

export default function PolygonZoneSelector({ display }) {
    const defaultDuration = 10;
    const { settings } = useAdmin();
    const [localZoneSettings, setLocalZoneSettings, applyLocalZoneSettings] = useLocalVariable(settings.zones, (e) => emitSettings({...settings, zone: e}));
    const [localOutOfZoneDelay, setLocalOutOfZoneDelay, applyLocalOutOfZoneDelay] = useLocalVariable(settings.outOfZoneDelay, (e) => emitSettings({...settings, outOfZoneDelay: e}));

    useEffect(() => {
        if (!localZoneSettings || localZoneSettings.type != ZoneTypes.POLYGON) {
            setLocalZoneSettings(defaultZoneSettings.polygon);
        }
    }, [localZoneSettings, setLocalZoneSettings]);

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
    
    return (
        <div className={display ? 'w-full h-full gap-3 flex flex-row' : "hidden"}>
            {localZoneSettings && localZoneSettings.type == ZoneTypes.POLYGON && <>
                <div className="h-full flex-1">
                    <CustomMapContainer>
                        <Drawings localZoneSettings={localZoneSettings} addZone={addZone} removeZone={removeZone} />
                    </CustomMapContainer>
                </div>
                <div className="h-full w-1/6 flex flex-col gap-3">
                    <div className="w-full text-center">
                        <h2 className="text-xl">Ordre de réduction</h2>
                    </div>
                    <ReorderList droppableId="zones-order" array={localZoneSettings.polygons} setArray={setLocalZoneSettingsPolygons}>
                        { (zone) =>
                            <div key={zone.id} className="w-full p-2 bg-white flex flex-row gap-2 items-center justify-between">
                                <p>Zone {zone.id}</p>
                                <NumberInput id={zone.id} value={zone.duration || ""} onChange={value => updateDuration(zone.id, value)}/>
                            </div>
                        }
                    </ReorderList>
                    <div className="w-full flex flex-row gap-2 items-center justify-between">
                        <p>Temps permis hors zone</p>
                        <NumberInput id="timeout-polygon-selector" value={localOutOfZoneDelay ?? ""} onChange={setLocalOutOfZoneDelay}/>
                    </div>
                    <button className="w-full h-16 text-lg text-white rounded bg-green-600 hover:bg-green-500" onClick={handleSubmit}>Appliquer</button>
                </div>
            </>}
        </div>
    );
}
