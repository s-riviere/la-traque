"use client";
import { useState, useEffect } from "react";
import GameSettings from "@/components/admin/gameSettings";
import { useAdminConnexion } from "@/context/adminConnexionContext";
import dynamic from "next/dynamic";
import TeamList from '@/components/admin/teamManager';
import useAdmin from '@/hook/useAdmin';
import Link from "next/link";
import { GreenButton } from "@/components/util/button";
import { TextInput } from "@/components/util/textInput";
import { Section } from "@/components/util/section";

// Imported at runtime and not at compile time
const ZoneSelector = dynamic(() => import('@/components/admin/polygonZoneMap'), { ssr: false });

export default function AdminPage() {
    const {penaltySettings, changePenaltySettings} = useAdmin();
    const { addTeam } = useAdmin();
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
                <GameSettings />
                <Section className="h-full" title="Équipe">
                    <div className="w-full h-full gap-3 flex flex-col items-center">
                        <TeamList/>
                        <div className="w-full flex flex-row gap-2 items-center justify-between">
                            <p>Interval between position updates</p>
                            <div className="w-16 h-10">
                                <TextInput value={allowedTimeBetweenUpdates} onChange={(e) => setAllowedTimeBetweenUpdates(e.target.value)} />
                            </div>
                        </div>
                        <div className="w-40 h-15">
                            <GreenButton onClick={applySettings}>Apply</GreenButton>
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