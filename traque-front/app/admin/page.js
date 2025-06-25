"use client";
import TeamReady from "@/components/admin/teamReady";
import { BlueButton, GreenButton, RedButton } from "@/components/util/button";
import { useAdminConnexion } from "@/context/adminConnexionContext";
import useAdmin from "@/hook/useAdmin";
import { GameState } from "@/util/gameState";
import dynamic from "next/dynamic";

// Imported at runtime and not at compile time
const LiveMap = dynamic(() => import('@/components/admin/liveMap'), { ssr: false });

export default function AdminPage() {
    const { useProtect } = useAdminConnexion();
    const { gameState, changeState } = useAdmin();

    useProtect();
    
    return (
        <div className='min-h-full bg-gray-200 p-10 flex flex-row content-start gap-5'>
            <div className="h-full w-2/6">
                <div className='w-full mb-5 h-1/2 gap-3 bg-white p-10 flex flex-col text-center shadow-2xl '>
                    <h2 className="text-2xl">Game state</h2>
                    <strong className="p-5 bg-gray-900 text-white text-xl rounded">Current : {gameState}</strong>
                    <div className="flex flex-row">
                        <RedButton onClick={() => changeState(GameState.SETUP)}>Reset game</RedButton>
                        <GreenButton onClick={() => changeState(GameState.PLACEMENT)}>Start placement</GreenButton>
                        <BlueButton onClick={() => changeState(GameState.PLAYING)}>Start game</BlueButton>
                    </div>
                </div>
                {gameState == GameState.PLACEMENT && <TeamReady />}
            </div>
            <div className='grow flex-1 row-span-2 bg-white p-10 flex shadow-2xl'>
                <LiveMap />
            </div>
        </div>
    )
}