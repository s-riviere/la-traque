import { useState } from "react";
import dynamic from "next/dynamic";
import { ZoneTypes } from "@/util/types";

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

export default function PlayingZoneSelector() {
    const [zoneType, setZoneType] = useState(ZoneTypes.POLYGON);

    return (
        <div className="w-full h-full flex flex-col gap-3">
            <div className="w-full flex flex-row gap-3 items-center">
                <p className="text-l">Type de zone :</p>
                <ZoneTypeButton title="Cercles" onClick={() => setZoneType(ZoneTypes.CIRCLE)} isSelected={zoneType == ZoneTypes.CIRCLE} />
                <ZoneTypeButton title="Polygones" onClick={() => setZoneType(ZoneTypes.POLYGON)} isSelected={zoneType == ZoneTypes.POLYGON} />
            </div>
            <div className="w-full flex-1">
                {zoneType == ZoneTypes.CIRCLE &&
                    <CircleZoneSelector/>
                }
                {zoneType == ZoneTypes.POLYGON &&
                    <PolygonZoneSelector/>
                }
            </div>
        </div>
    );
}
