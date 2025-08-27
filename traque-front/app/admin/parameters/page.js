"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { TextInput } from "@/components/textInput";
import { Section } from "@/components/section";
import { useAdminConnexion } from "@/context/adminConnexionContext";
import useAdmin from '@/hook/useAdmin';
import Messages from "./components/messages";
import TeamList from './components/teamManager';

// Imported at runtime and not at compile time
const ZoneSelector = dynamic(() => import('./components/polygonZoneMap'), { ssr: false });

export default function AdminPage() {
    const {penaltySettings, changePenaltySettings} = useAdmin();
    const { useProtect } = useAdminConnexion();
    const [allowedTimeBetweenUpdates, setAllowedTimeBetweenUpdates] = useState("");

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

    return (
        <div className='h-full bg-gray-200 p-3 flex flex-row gap-3'>
            <div className="h-full w-3/6 gap-3 flex flex-col">
                <div className='w-full bg-custom-light-blue gap-5 p-5 flex flex-row shadow-2xl'>
                    <Link href="/admin">
                        <img src="/icons/backarrow.png" className="w-8 h-8" title="Main page" />
                    </Link>
                    <h2 className="text-3xl font-bold">Paramètres</h2>
                </div>
                <Messages/>
                <Section className="h-full" title="Équipe">
                    <div className="w-full h-full gap-3 flex flex-col items-center">
                        <TeamList/>
                        <div className="w-full flex flex-row gap-2 items-center justify-between">
                            <p>Interval between position updates</p>
                            <div className="w-16 h-10">
                                <TextInput value={allowedTimeBetweenUpdates} onChange={(e) => setAllowedTimeBetweenUpdates(e.target.value)} onBlur={applySettings} />
                            </div>
                        </div>
                    </div>
                </Section>
            </div>
            <div className="h-full w-full">
                <ZoneSelector />
            </div>
        </div>
    );
}
