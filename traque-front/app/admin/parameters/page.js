"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { TextInput } from "@/components/textInput";
import { Section } from "@/components/section";
import { useAdminConnexion } from "@/context/adminConnexionContext";
import useAdmin from '@/hook/useAdmin';
import Messages from "./components/messages";
import TeamManager from './components/teamManager';

// Imported at runtime and not at compile time
const ZoneSelector = dynamic(() => import('./components/polygonZoneMap'), { ssr: false });

export default function AdminPage() {
    const {penaltySettings, changePenaltySettings, addTeam} = useAdmin();
    const { useProtect } = useAdminConnexion();
    const [allowedTimeBetweenUpdates, setAllowedTimeBetweenUpdates] = useState("");
    const [teamName, setTeamName] = useState('');

    useProtect();
    
    useEffect(() => {
        if (penaltySettings) {
            setAllowedTimeBetweenUpdates(penaltySettings.allowedTimeBetweenPositionUpdate.toString());
        }
    }, [penaltySettings]);

    function applySettings() {
        if (Number(allowedTimeBetweenUpdates) != penaltySettings.allowedTimeBetweenPositionUpdate) {
            changePenaltySettings({allowedTimeBetweenPositionUpdate: Number(allowedTimeBetweenUpdates)});
        }
    }
    
    function handleSubmit(e) {
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
                    <form className='w-full flex flex-row gap-3' onSubmit={handleSubmit}>
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
                            <TextInput value={allowedTimeBetweenUpdates} onChange={(e) => setAllowedTimeBetweenUpdates(e.target.value)} onBlur={applySettings} />
                        </div>
                    </div>
                </Section>
            </div>
            <div className="h-full flex-1">
                <ZoneSelector />
            </div>
        </div>
    );
}
