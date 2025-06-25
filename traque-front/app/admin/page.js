"use client";
import { useAdminConnexion } from "@/context/adminConnexionContext";
import useAdmin from "@/hook/useAdmin";
import dynamic from "next/dynamic";
import TeamList from '@/components/admin/teamList';
import React, { useState } from 'react'
import TeamEdit from '@/components/admin/teamEdit';
import TeamAddForm from '@/components/admin/teamAdd';
import Link from "next/link";

const LiveMap = dynamic(() => import('@/components/admin/mapPicker').then((mod) => mod.LiveMap), {
    ssr: false
});

export default function AdminPage() {
    const { useProtect } = useAdminConnexion();
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const { addTeam, gameState, changeState, teams } = useAdmin();
    useProtect();
    return (
        <div className='min-h-full bg-gray-200 p-5 flex flex-row content-start gap-5'>
            <div className="h-full w-2/6">
                <div className='w-full mb-5 h-1/2 gap-3 bg-blue-400 p-10 flex flex-col text-left shadow-2xl'>
                    <h2 className="text-4xl font-bold">Page Principale</h2>
                </div>
                <div className='w-full mb-5 h-1/2 gap-3 bg-white flex flex-col'>
                    <div className='w-full gap-3 bg-blue-400 flex flex-col items-center justify-center text-middle shadow-2xl p-1'>
                        <h2 className="text-2xl">Contrôle</h2>
                    </div>
                    <div className="flex flex-row justify-between items-center px-6 py-3">
                        <Link 
                            href="/admin/teams"
                            className="w-[4.5rem] h-[4.5rem] bg-blue-400 rounded-lg hover:bg-blue-500 transition flex items-center justify-center" 
                            title="Accéder aux paramètres du jeu">
                            <img src="/icons/parameters.png" className="w-10 h-10" />
                        </Link>
                        <button 
                            className="w-[4.5rem] h-[4.5rem] bg-blue-400 rounded-lg hover:bg-blue-500 transition flex items-center justify-center" 
                            title="Reprendre la partie">
                            <img src="/icons/play.png" className="w-10 h-10" />
                        </button>
                        <button 
                            className="w-[4.5rem] h-[4.5rem] bg-blue-400 rounded-lg hover:bg-blue-500 transition flex items-center justify-center" 
                            title="Réinitialiser la partie">
                            <img src="/icons/reset.png" className="w-10 h-10" />
                        </button>
                        <button 
                            className="w-[4.5rem] h-[4.5rem] bg-blue-400 rounded-lg hover:bg-blue-500 transition flex items-center justify-center" 
                            title="Commencer les placements">
                            <img src="/icons/placement.png" className="w-10 h-10" />
                        </button>
                        <button 
                            className="w-[4.5rem] h-[4.5rem] bg-blue-400 rounded-lg hover:bg-blue-500 transition flex items-center justify-center" 
                            title="Lancer la traque">
                            <img src="/icons/begin.png" className="w-10 h-10" />
                        </button>
                    </div>
                </div>
                <div className='h-full w-full mb-5 h-1/2 gap-3 bg-white flex flex-col'>
                    <div className='w-full gap-3 bg-blue-400 flex flex-col items-center justify-center text-middle shadow-2xl p-1'>
                        <h2 className="text-2xl">Équipes</h2>
                    </div>
                    <div className="items-center px-6 py-3">
                        <TeamAddForm onAddTeam={addTeam}/>
                        <TeamList selectedTeamId={selectedTeamId} onSelected={setSelectedTeamId}/>
                    </div>
                </div>
            </div>
            <div className='grow flex-1 flex flex-col bg-white p-5 shadow-2xl relative'>
                <div className="flex-1 flex items-center justify-center bg-gray-200 mb-5">
                    <LiveMap/>
                </div>
                <div className='w-full flex flex-row gap-10 items-center px-6'>
                    <button 
                        className="w-16 h-16 bg-blue-400 rounded-full hover:bg-blue-500 transition flex items-center justify-center"
                        title ="Changer le style de la carte">
                        <img src="/icons/mapstyle.png" className="w-10 h-10" />
                    </button>
                    <button 
                        className="w-16 h-16 bg-blue-400 rounded-full hover:bg-blue-500 transition flex items-center justify-center"
                        title ="Afficher/cacher les zones">
                        <img src="/icons/zones.png" className="w-10 h-10" />
                    </button>
                    <button 
                        className="w-16 h-16 bg-blue-400 rounded-full hover:bg-blue-500 transition flex items-center justify-center"
                        title ="Afficher/cacher les noms des équipes">
                        <img src="/icons/names.png" className="w-10 h-10" />
                    </button>
                    <button 
                        className="w-16 h-16 bg-blue-400 rounded-full hover:bg-blue-500 transition flex items-center justify-center"
                        title ="Afficher/cacher les relations de traque">
                        <img src="/icons/arrows.png" className="w-10 h-10" />
                    </button>
                    <button 
                        className="w-16 h-16 bg-blue-400 rounded-full hover:bg-blue-500 transition flex items-center justify-center"
                        title ="Afficher/cacher les incertitudes de position">
                        <img src="/icons/incertitude.png" className="w-10 h-10" />
                    </button>
                    <button 
                        className="w-16 h-16 bg-blue-400 rounded-full hover:bg-blue-500 transition flex items-center justify-center"
                        title ="Afficher/cacher les chemins des équipes">
                        <img src="/icons/path.png" className="w-10 h-10" />
                    </button>
                    <button 
                        className="w-16 h-16 bg-blue-400 rounded-full hover:bg-blue-500 transition flex items-center justify-center"
                        title ="Afficher/cacher les événements">
                        <img src="/icons/informations.png" className="w-10 h-10" />
                    </button>
                </div>
            </div>
        </div>
    )
}