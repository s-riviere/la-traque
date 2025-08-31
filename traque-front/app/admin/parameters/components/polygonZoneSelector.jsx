import { useEffect, useState } from "react";
import { Polyline, Polygon, CircleMarker, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { GreenButton } from "@/components/button";
import { ReorderList } from "@/components/list";
import { CustomMapContainer, MapEventListener } from "@/components/map";
import { TextInput } from "@/components/input";
import useAdmin from "@/hook/useAdmin";
import useMapPolygonDraw from "@/hook/useMapPolygonDraw";

function Drawings({ polygons, addPolygon, removePolygon }) {
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

    function DrawPolygon({polygon, number}) {
        const length = polygon.length;

        if (length < 3) return null;

        const sum = polygon.reduce(
            (acc, coord) => ({
                lat: acc.lat + coord.lat,
                lng: acc.lng + coord.lng
            }),
            { lat: 0, lng: 0 }
        );

        // meanPoint can be out of the polygon
        // Idea : take the mean point of the largest connected subpolygon
        const meanPoint = {lat: sum.lat / length, lng: sum.lng / length}

        const numberIcon = L.divIcon({
            html: `<div style="
                font-size: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 25px;
            ">${number}</div>`,
            className: 'custom-number-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        return (
            <div>
                <Polygon positions={polygon} pathOptions={{ color: 'black', fillColor: 'black', fillOpacity: '0.5', weight: lineThickness }} />
                <Marker position={meanPoint} icon={numberIcon} />
            </div>
        );
    }

    return (
        <div>
            <MapEventListener onLeftClick={handleLeftClick}  onRightClick={handleRightClick} onMouseMove={handleMouseMove} />
            {polygons.map((polygon, i) => <DrawPolygon key={i} polygon={polygon} number={i+1} />)}
            <DrawUnfinishedPolygon polygon={currentPolygon} />
            {highlightNodes.map((node, i) => <DrawNode key={i} pos={node} color={"black"} />)}
        </div>
    );
}

export default function PolygonZoneSelector() {
    const defaultDuration = 10;
    const [zones, setZones] = useState([]);
    const [polygons, setPolygons] = useState([]);
    const {zoneSettings, changeZoneSettings} = useAdmin();
    const {penaltySettings, changePenaltySettings} = useAdmin();
    const [allowedTimeOutOfZone, setAllowedTimeOutOfZone] = useState("");

    useEffect(() => {
        setPolygons(zones.map((zone) => zone.polygon));
    }, [zones])

    useEffect(() => {
        if (zoneSettings) {
            setZones(zoneSettings.map((zone) => ({id: idFromPolygon(zone.polygon), polygon: zone.polygon, duration: zone.duration})));
        }
        if (penaltySettings) {
            setAllowedTimeOutOfZone(penaltySettings.allowedTimeOutOfZone.toString());
        }
    }, [zoneSettings, penaltySettings]);

    function idFromPolygon(polygon) {
        return (polygon[0].lat + polygon[1].lat + polygon[2].lat).toString() + (polygon[0].lng + polygon[1].lng + polygon[2].lng).toString();
    }

    function addPolygon(polygon) {
        setZones([...zones, {id: idFromPolygon(polygon), polygon: polygon, duration: defaultDuration}]);
    }

    function removePolygon(i) {
        setZones(zones.filter((_, index) => index !== i));
    }

    function updateDuration(i, duration) {
        setZones(zones.map((zone, index) => index === i ? {id: zone.id, polygon: zone.polygon, duration: duration} : zone));
    }

    function handleSettingsSubmit() {
        changeZoneSettings(zones);
        changePenaltySettings({allowedTimeOutOfZone: Number(allowedTimeOutOfZone)});
    }
    
    return (
        <div className='h-full w-full bg-white p-3 gap-3 flex flex-row shadow-2xl'>
            <div className="h-full flex-1">
                <CustomMapContainer>
                    <Drawings polygons={polygons} addPolygon={addPolygon} removePolygon={removePolygon} />
                </CustomMapContainer>
            </div>
            <div className="h-full w-1/6 flex flex-col gap-3">
                <div className="w-full text-center">
                    <h2 className="text-xl">Reduction order</h2>
                </div>
                <ReorderList droppableId="zones-order" array={zones} setArray={setZones}>
                    { (zone, i) =>
                        <div className="w-full p-2 bg-white flex flex-row gap-2 items-center justify-between">
                            <p>Zone {i+1}</p>
                            <div className="w-16 h-10">
                                <TextInput value={zone.duration} onChange={(e) => updateDuration(i, e.target.value)}/>
                            </div>
                        </div>
                    }
                </ReorderList>
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
