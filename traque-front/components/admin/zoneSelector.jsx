import { useEffect, useState } from "react";
import BlueButton, { GreenButton, RedButton } from "../util/button";
import { EditMode, ZonePicker } from "./mapPicker";
import TextInput from "../util/textInput";
import useAdmin from "@/hook/useAdmin";

export function ZoneSelector() {
    const [editMode, setEditMode] = useState(EditMode.MIN);
    const [minZone, setMinZone] = useState(null);
    const [maxZone, setMaxZone] = useState(null);
    const [reductionCount, setReductionCount] = useState("");
    const [reductionDuration, setReductionDuration] = useState("");
    const [reductionInterval, setReductionInterval] = useState("");
    const {zoneSettings, changeZoneSettings} = useAdmin();

    useEffect(() => {
        if (zoneSettings) {
            setMinZone(zoneSettings.min);
            setMaxZone(zoneSettings.max);
            setReductionCount(zoneSettings.reductionCount.toString());
            setReductionDuration(zoneSettings.reductionDuration.toString());
            setReductionInterval(zoneSettings.reductionInterval.toString());
        }
    }, [zoneSettings]);

    function handleSettingsSubmit() {
        const newSettings = {min:minZone, max:maxZone, reductionCount: Number(reductionCount), reductionDuration: Number(reductionDuration), reductionInterval: Number(reductionInterval)};
        const changingSettings = {};
        for (const key in newSettings) {
            if (newSettings[key] != zoneSettings[key]) {
                changingSettings[key] = newSettings[key];
            }
        }
        changeZoneSettings(changingSettings);
    }

    //When the user set one zone, switch to the other
    useEffect(() => {
        if(editMode == EditMode.MIN) {
            setEditMode(EditMode.MAX);
        }else {
            setEditMode(EditMode.MIN);
        }

    }, [minZone, maxZone]);

    return <div className='w-2/5 h-full gap-1 bg-white p-10 flex flex-col text-center shadow-2xl overflow-y-scroll'>
        <h2 className="text-2xl">Edit zones</h2>
        {editMode == EditMode.MIN && <BlueButton onClick={() => setEditMode(EditMode.MAX)}>Click to edit first zone</BlueButton>}
        {editMode == EditMode.MAX && <RedButton onClick={() => setEditMode(EditMode.MIN)}>Click to edit last zone</RedButton>}
        <ZonePicker minZone={minZone} maxZone={maxZone} editMode={editMode} setMinZone={setMinZone} setMaxZone={setMaxZone} />
        <div>
            <p>Number of reductions</p>
            <TextInput value={reductionCount} onChange={(e) => setReductionCount(e.target.value)}></TextInput>
        </div>
        <div>
            <p>Duration of each reduction</p>
            <TextInput value={reductionDuration} onChange={(e) => setReductionDuration(e.target.value)}></TextInput>
        </div>
        <div>
            <p>Interval between reductions</p>
            <TextInput value={reductionInterval} onChange={(e) => setReductionInterval(e.target.value)}></TextInput>
        </div>
        <GreenButton onClick={handleSettingsSubmit}>Apply</GreenButton>
    </div>
}