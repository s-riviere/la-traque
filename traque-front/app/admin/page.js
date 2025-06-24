"use client";
import { useAdminConnexion } from "@/context/adminConnexionContext";
import useAdmin from "@/hook/useAdmin";
import dynamic from "next/dynamic";
import TeamList from '@/components/admin/teamList';
import TeamAddForm from '@/components/admin/teamAdd';
import React, { useState } from 'react'
import TeamEdit from '@/components/admin/teamEdit';

const LiveMap = dynamic(() => import('@/components/admin/mapPicker').then((mod) => mod.LiveMap), {
    ssr: false
});
export default function AdminPage() {
    const { useProtect } = useAdminConnexion();
    const { gameState, changeState } = useAdmin();
    const { addTeam } = useAdmin();
    const [selectedTeamId, setSelectedTeamId] = useState(null);
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
                        <button className="w-[4.5rem] h-[4.5rem] bg-blue-400 rounded-lg hover:bg-blue-500 transition flex items-center justify-center" >
                            <img src="/icons/parameters.png" className="w-10 h-10" />
                        </button>
                        <button className="w-[4.5rem] h-[4.5rem] bg-blue-400 rounded-lg hover:bg-blue-500 transition flex items-center justify-center" >
                            <img src="/icons/play.png" className="w-10 h-10" />
                        </button>
                        <button className="w-[4.5rem] h-[4.5rem] bg-blue-400 rounded-lg hover:bg-blue-500 transition flex items-center justify-center" >
                            <img src="/icons/reset.png" className="w-10 h-10" />
                        </button>
                        <button className="w-[4.5rem] h-[4.5rem] bg-blue-400 rounded-lg hover:bg-blue-500 transition flex items-center justify-center" >
                            <img src="/icons/placement.png" className="w-10 h-10" />
                        </button>
                        <button className="w-[4.5rem] h-[4.5rem] bg-blue-400 rounded-lg hover:bg-blue-500 transition flex items-center justify-center" >
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
            <div className='grow flex-1 flex flex-col bg-white p-5 shadow-2xl'>
                <div className="flex-1 flex items-center justify-center bg-gray-200 mb-5">
                    <LiveMap/>
                </div>
                <div className='w-full flex flex-row gap-16 items-center px-6'>
                    <button className="w-16 h-16 bg-blue-400 rounded-full hover:bg-blue-500 transition flex items-center justify-center">
                        <img src="/icons/parameters.png" className="w-10 h-10" />
                    </button>
                    <button className="w-16 h-16 bg-blue-400 rounded-full hover:bg-blue-500 transition flex items-center justify-center">
                        <img src="/icons/parameters.png" className="w-10 h-10" />
                    </button>
                    <button className="w-16 h-16 bg-blue-400 rounded-full hover:bg-blue-500 transition flex items-center justify-center">
                        <img src="/icons/parameters.png" className="w-10 h-10" />
                    </button>
                    <button className="w-16 h-16 bg-blue-400 rounded-full hover:bg-blue-500 transition flex items-center justify-center">
                        <img src="/icons/parameters.png" className="w-10 h-10" />
                    </button>
                    <button className="w-16 h-16 bg-blue-400 rounded-full hover:bg-blue-500 transition flex items-center justify-center">
                        <img src="/icons/parameters.png" className="w-10 h-10" />
                    </button>
                    <button className="w-16 h-16 bg-blue-400 rounded-full hover:bg-blue-500 transition flex items-center justify-center">
                        <img src="/icons/parameters.png" className="w-10 h-10" />
                    </button>
                </div>
            </div>
        </div>
    )
}