"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { TextInput } from "@/components/input";
import { Section } from "@/components/section";
import { BlueButton } from "@/components/button";
import { useAdminConnexion } from "@/context/adminConnexionContext";
import useAdmin from '@/hook/useAdmin';
import Messages from "./components/messages";
import TeamManager from './components/teamManager';
import useLocalVariable from "@/hook/useLocalVariable";

// Imported at runtime and not at compile time
const PolygonZoneSelector = dynamic(() => import('./components/polygonZoneSelector'), { ssr: false });
const CircleZoneSelector = dynamic(() => import('./components/circleZoneSelector'), { ssr: false });

const zoneTypes = {
    circle: "circle",
    polygon: "polygon"
}

const defaultCircleSettings = {type: zoneTypes.circle, min: null, max: null, reductionCount: 4, duration: 10}
const defaultPolygonSettings = {type: zoneTypes.polygon, polygons: []}

export default function ConfigurationPage() {
    const { useProtect } = useAdminConnexion();
    const {zoneSettings, sendPositionDelay, updateSettings, addTeam} = useAdmin();
    const [teamName, setTeamName] = useState('');
    const [localZoneSettings, setLocalZoneSettings, applyLocalZoneSettings] = useLocalVariable(zoneSettings, (e) => updateSettings({zone: e}));
    const [localSendPositionDelay, setLocalSendPositionDelay, applyLocalSendPositionDelay] = useLocalVariable(sendPositionDelay, (e) => updateSettings({sendPositionDelay: e}));

    useProtect();

    function modifyLocalZoneSettings(key, value) {
        setLocalZoneSettings(prev => ({...prev, [key]: value}));
    };

    function handleChangeZoneType() {
        setLocalZoneSettings(localZoneSettings.type == zoneTypes.circle ? defaultPolygonSettings : defaultCircleSettings)
    }
    
    function handleTeamSubmit(e) {
        e.preventDefault();
        if (teamName !== "") {
            addTeam(teamName);
            setTeamName("")
        }
    }

    return (
        <div className='h-full bg-gray-200 p-3 flex flex-row gap-3'>
            <div className="h-full w-2/6 gap-3 flex flex-col">
                <div className='w-full bg-custom-light-blue gap-5 p-5 flex flex-row shadow-2xl'>
                    <Link href="/admin">
                        <img src="/icons/backarrow.png" className="w-8 h-8" title="Main page" />
                    </Link>
                    <h2 className="text-3xl font-bold">Paramètres</h2>
                </div>
                <Messages/>
                <Section title="Équipe" outerClassName="flex-1 min-h-0" innerClassName="flex flex-col items-center gap-3">
                    <form className='w-full flex flex-row gap-3' onSubmit={handleTeamSubmit}>
                        <div className='w-full'>
                            <input name="teamName" label='Team name' value={teamName} onChange={(e) => setTeamName(e.target.value)} type="text" className="w-full h-full p-4 ring-1 ring-inset ring-gray-300" />
                        </div>
                        <div className='w-1/5'>
                            <button type="submit" className="w-full h-full bg-custom-light-blue hover:bg-blue-500 transition text-3xl font-bold">+</button>
                        </div>
                    </form>
                    <div className="w-full flex-1 min-h-0 ">
                        <TeamManager/>
                    </div>
                    <div className="w-full flex flex-row gap-2 items-center justify-between">
                        <p>Interval between position updates</p>
                        <div className="w-16 h-10">
                            <TextInput id="position-update" value={localSendPositionDelay ?? ""} onChange={(e) => setLocalSendPositionDelay(parseInt(e.target.value, 10))} onBlur={applyLocalSendPositionDelay} />
                        </div>
                    </div>
                </Section>
            </div>
            <div className="h-full flex-1 flex flex-col p-3 gap-3 bg-white shadow-2xl">
                <div className="w-full h-15">
                    {localZoneSettings && <BlueButton onClick={handleChangeZoneType}>Change zone type</BlueButton>}
                </div>
                <div className="w-full flex-1">
                    {localZoneSettings && localZoneSettings.type == zoneTypes.circle &&
                        <CircleZoneSelector zoneSettings={localZoneSettings} modifyZoneSettings={modifyLocalZoneSettings} applyZoneSettings={applyLocalZoneSettings}/>
                    }
                    {localZoneSettings && localZoneSettings.type == zoneTypes.polygon &&
                        <PolygonZoneSelector zoneSettings={localZoneSettings} modifyZoneSettings={modifyLocalZoneSettings} applyZoneSettings={applyLocalZoneSettings}/>
                    }
                </div>
            </div>
        </div>
    );
}
