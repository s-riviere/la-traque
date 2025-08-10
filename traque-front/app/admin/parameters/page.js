"use client";
import GameSettings from "@/components/admin/gameSettings";
import { useAdminConnexion } from "@/context/adminConnexionContext";
import dynamic from "next/dynamic";

// Imported at runtime and not at compile time
const ZoneSelector = dynamic(() => import('@/components/admin/polygonZoneMap'), { ssr: false });

export default function AdminPage() {
    const { useProtect } = useAdminConnexion();
    
    useProtect();

    return (
        <div className='h-full bg-gray-200 p-10 flex flex-row gap-5'>
            <div className="h-full w-2/6">
                <GameSettings />
            </div>
            <div className="h-full w-full">
                <ZoneSelector />
            </div>
        </div>
    );
}