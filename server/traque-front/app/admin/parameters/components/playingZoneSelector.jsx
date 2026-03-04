import dynamic from "next/dynamic";
import { ZoneTypes } from "@/util/types";
import useLocalVariable from "@/hook/useLocalVariable";
import useAdmin from "@/hook/useAdmin";

// Imported at runtime and not at compile time
const CircleZoneSelector = dynamic(() => import('./circleZoneSelector'), { ssr: false });
const PolygonZoneSelector = dynamic(() => import('./polygonZoneSelector'), { ssr: false });

function ZoneTypeButton({title, onClick, isSelected}) {
    const grayStyle = "bg-gray-300 hover:bg-gray-400";
    const blueStyle = "bg-custom-light-blue";

    return (
        <div className={`flex justify-center items-center rounded-md cursor-pointer ${isSelected ? blueStyle : grayStyle}`} onClick={onClick}>
            <p className="text-l font-bold p-2">{title}</p>
        </div>
    );
}

export default function PlayingZoneSelector({ display }) {

    return (
        <div className={display ? 'w-full h-full gap-3 flex flex-col' : "hidden"}>
            <div className="w-full flex flex-row gap-3 items-center">
                <p className="text-l">Type de zone :</p>
                <ZoneTypeButton title="Cercles" onClick={() => setLocalZoneType(ZoneTypes.CIRCLE)} isSelected={ZoneTypes.POLYGON == ZoneTypes.CIRCLE} />
                <ZoneTypeButton title="Polygones" onClick={() => setLocalZoneType(ZoneTypes.POLYGON)} isSelected={ZoneTypes.POLYGON == ZoneTypes.POLYGON} />
            </div>
            <div className="w-full flex-1">
                <CircleZoneSelector display={ZoneTypes.POLYGON == ZoneTypes.CIRCLE} />
                <PolygonZoneSelector display={ZoneTypes.POLYGON == ZoneTypes.POLYGON} />
            </div>
        </div>
    );
}
