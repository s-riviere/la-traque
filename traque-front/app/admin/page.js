"use client";
import React, { useState } from 'react';
import dynamic from "next/dynamic";
import Link from "next/link";
import { Section } from "@/components/section";
import { useAdminConnexion } from "@/context/adminConnexionContext";
import TeamSidePanel from "./components/teamSidePanel";
import TeamList from './components/teamViewer';
import { MapButton, ControlButton } from './components/buttons';

// Imported at runtime and not at compile time
const LiveMap = dynamic(() => import('./components/liveMap'), { ssr: false });

export default function AdminPage() {
    const { useProtect } = useAdminConnexion();
    const [selectedTeamId, setSelectedTeamId] = useState(null);

    useProtect();

    function onSelected(id) {
        if (selectedTeamId === id) {
            setSelectedTeamId(null);
        } else {
            setSelectedTeamId(id);
        }
    }
    
    return (
        <div className='h-full bg-gray-200 p-3 flex flex-row content-start gap-3'>
            <div className="h-full w-2/6 flex flex-col gap-3">
                <div className='w-full bg-custom-light-blue gap-5 p-5 flex flex-row shadow-2xl'>
                    <img src="/icons/home.png" className="w-8 h-8" />
                    <h2 className="text-3xl font-bold">Page principale</h2>
                </div>
                <Section title="Contrôle">
                    <div className='w-full h-full flex flex-row justify-between'>
                        <Link href="/admin/parameters">
                            <ControlButton icon="parameters" title="Accéder aux paramètres du jeu"/>
                        </Link>
                        <ControlButton icon="play" title="Reprendre la partie"/>
                        <ControlButton icon="reset" title="Réinitialiser la partie"/>
                        <ControlButton icon="placement" title="Commencer les placements"/>
                        <ControlButton icon="begin" title="Lancer la traque"/>
                    </div>
                </Section>
                <Section className="h-full" title="Équipes">
                    <div className="w-full h-full bg-gray-300 p-1">
                        <TeamList selectedTeamId={selectedTeamId} onSelected={onSelected}/>
                    </div>
                </Section>
            </div>
            <div className='grow flex-1 flex flex-col bg-white p-3 gap-3 shadow-2xl'>
                <div className="flex-1 flex flex-row gap-3">
                    <LiveMap/>
                    <TeamSidePanel selectedTeamId={selectedTeamId} onClose={() => setSelectedTeamId(null)}/>
                </div>
                <div className='w-full flex flex-row items-center justify-evenly py-2'>
                    <MapButton icon="mapstyle" title="Changer le style de la carte"/>
                    <MapButton icon="zones" title="Afficher/masquer les zones"/>
                    <MapButton icon="names" title="Afficher/masquer les noms des équipes"/>
                    <MapButton icon="arrows" title="Afficher/masquer les relations de traque"/>
                    <MapButton icon="incertitude" title="Afficher/masquer les incertitudes de position"/>
                    <MapButton icon="path" title="Afficher/masquer la trace de l'équipe sélectionnée"/>
                    <MapButton icon="informations" title="Afficher/masquer les évènements de l'équipe sélectionnée"/>
                </div>
            </div>
        </div>
    )
}
