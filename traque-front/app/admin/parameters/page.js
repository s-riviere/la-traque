"use client";
import { GameSettings } from "@/components/admin/gameSettings";
import { PenaltySettings } from "@/components/admin/penaltySettings";
import { useAdminConnexion } from "@/context/adminConnexionContext";
import dynamic from "next/dynamic";
import TeamAddForm from '@/components/admin/teamAdd';
import useAdmin from '@/hook/useAdmin';
import Link from "next/link";

const ZoneSelector = dynamic(() => import('@/components/admin/zoneSelector').then((mod) => mod.ZoneSelector), {
    ssr: false
});
export default function AdminPage() {
    const { addTeam } = useAdmin();
    const { useProtect } = useAdminConnexion();
    useProtect();
    return (
        <div className='min-h-full bg-gray-200 p-5 flex flex-row content-start gap-5'>
            <div className="h-full w-2/5">
                <div className='w-full mb-5 h-full gap-3 bg-blue-400 p-7 flex flex-row text-left shadow-2xl'>
                    <Link href="/admin" className="w-fit flex items-center text-white hover:text-blue-900 transition-colors">
                        <img src="/icons/backarrow.png" className="w-10 h-10 mr-10" title="retour" />
                    </Link>
                    <h2 className="text-4xl font-bold">Paramètres</h2>
                </div>
                <TeamAddForm onAddTeam={addTeam}/>
                <GameSettings />
            </div>
            <ZoneSelector />
            <PenaltySettings />
        </div>
    )
}