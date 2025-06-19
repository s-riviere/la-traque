"use client";
import { GameSettings } from "@/components/admin/gameSettings";
import { PenaltySettings } from "@/components/admin/penaltySettings";
import { useAdminConnexion } from "@/context/adminConnexionContext";
import dynamic from "next/dynamic";

const ZoneSelector = dynamic(() => import('@/components/admin/zoneSelector').then((mod) => mod.ZoneSelector), {
    ssr: false
});
export default function AdminPage() {
    const { useProtect } = useAdminConnexion();
    useProtect();
    return (
        <div className='min-h-full bg-gray-200 p-10 flex flex-row content-start gap-5'>
            <div className="h-full w-2/6">
                <GameSettings />
            </div>
            <ZoneSelector />
            <PenaltySettings />
        </div>
    )
}