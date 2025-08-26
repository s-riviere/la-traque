"use client";
import { useAdminConnexion } from "@/context/adminConnexionContext";
import dynamic from "next/dynamic";
import TeamList from '@/components/admin/teamViewer';
import React, { useState } from 'react'
import Link from "next/link";
import { Section } from "@/components/util/section";
import TeamInformation from "@/components/admin/teamInformation";

// Imported at runtime and not at compile time
const LiveMap = dynamic(() => import('@/components/admin/liveMap'), { ssr: false });

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
                        <Link 
                            href="/admin/parameters"
                            className="w-[4.5rem] h-[4.5rem] bg-custom-light-blue rounded-lg hover:bg-blue-500 transition flex items-center justify-center" 
                            title="Accéder aux paramètres du jeu">
                            <img src="/icons/parameters.png" className="w-10 h-10" />
                        </Link>
                        <button 
                            className="w-[4.5rem] h-[4.5rem] bg-custom-light-blue rounded-lg hover:bg-blue-500 transition flex items-center justify-center" 
                            title="Reprendre la partie">
                            <img src="/icons/play.png" className="w-10 h-10" />
                        </button>
                        <button 
                            className="w-[4.5rem] h-[4.5rem] bg-custom-light-blue rounded-lg hover:bg-blue-500 transition flex items-center justify-center" 
                            title="Réinitialiser la partie">
                            <img src="/icons/reset.png" className="w-10 h-10" />
                        </button>
                        <button 
                            className="w-[4.5rem] h-[4.5rem] bg-custom-light-blue rounded-lg hover:bg-blue-500 transition flex items-center justify-center" 
                            title="Commencer les placements">
                            <img src="/icons/placement.png" className="w-10 h-10" />
                        </button>
                        <button 
                            className="w-[4.5rem] h-[4.5rem] bg-custom-light-blue rounded-lg hover:bg-blue-500 transition flex items-center justify-center" 
                            title="Lancer la traque">
                            <img src="/icons/begin.png" className="w-10 h-10" />
                        </button>
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
                    <TeamInformation selectedTeamId={selectedTeamId} onClose={() => setSelectedTeamId(null)}/>
                </div>
                <div className='w-full flex flex-row items-center justify-evenly py-2'>
                    <button 
                        className="w-16 h-16 bg-custom-light-blue rounded-full hover:bg-blue-500 transition flex items-center justify-center"
                        title ="Changer le style de la carte">
                        <img src="/icons/mapstyle.png" className="w-10 h-10" />
                    </button>
                    <button 
                        className="w-16 h-16 bg-custom-light-blue rounded-full hover:bg-blue-500 transition flex items-center justify-center"
                        title ="Afficher/cacher les zones">
                        <img src="/icons/zones.png" className="w-10 h-10" />
                    </button>
                    <button 
                        className="w-16 h-16 bg-custom-light-blue rounded-full hover:bg-blue-500 transition flex items-center justify-center"
                        title ="Afficher/cacher les noms des équipes">
                        <img src="/icons/names.png" className="w-10 h-10" />
                    </button>
                    <button 
                        className="w-16 h-16 bg-custom-light-blue rounded-full hover:bg-blue-500 transition flex items-center justify-center"
                        title ="Afficher/cacher les relations de traque">
                        <img src="/icons/arrows.png" className="w-10 h-10" />
                    </button>
                    <button 
                        className="w-16 h-16 bg-custom-light-blue rounded-full hover:bg-blue-500 transition flex items-center justify-center"
                        title ="Afficher/cacher les incertitudes de position">
                        <img src="/icons/incertitude.png" className="w-10 h-10" />
                    </button>
                    <button 
                        className="w-16 h-16 bg-custom-light-blue rounded-full hover:bg-blue-500 transition flex items-center justify-center"
                        title ="Afficher/cacher les chemins des équipes">
                        <img src="/icons/path.png" className="w-10 h-10" />
                    </button>
                    <button 
                        className="w-16 h-16 bg-custom-light-blue rounded-full hover:bg-blue-500 transition flex items-center justify-center"
                        title ="Afficher/cacher les événements">
                        <img src="/icons/informations.png" className="w-10 h-10" />
                    </button>
                </div>
            </div>
        </div>
    )
}