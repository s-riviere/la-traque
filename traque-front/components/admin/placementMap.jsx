import useLocation from "@/hook/useLocation";
import "leaflet/dist/leaflet.css";
import { Circle, MapContainer, Marker, TileLayer } from "react-leaflet";
import useMapCircleDraw from "@/hook/useMapCircleDraw";
import { MapPan, MapEventListener } from "./mapUtils";

const DEFAULT_ZOOM = 14;
const positionIcon = new L.Icon({
    iconUrl: '/icons/location.png',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
    shadowSize: [30, 30],
});

export default function CircularAreaPicker({ area, setArea, markerPosition, ...props }) {
    const location = useLocation(Infinity);
    const { handleClick, handleMouseMove, center, radius } = useMapCircleDraw(area, setArea);

    return (
        <MapContainer  {...props} className='min-h-full w-full ' center={location} zoom={DEFAULT_ZOOM} scrollWheelZoom={true}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {center && radius && <Circle center={center} radius={radius} fillColor="blue" />}
            {markerPosition && <Marker position={markerPosition} icon={positionIcon}>
            </Marker>}
            <MapPan center={location} zoom={DEFAULT_ZOOM} />
            <MapEventListener onLeftClick={handleClick} onRightClick={() => {}} onMouseMove={handleMouseMove} />
        </MapContainer>
    );
}
