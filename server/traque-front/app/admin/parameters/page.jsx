"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/authContext";
import TeamManager from './components/teamManager';
import PlayingZoneSelector from "./components/playingZoneSelector";

// Imported at runtime and not at compile time
const PlacementZoneSelector = dynamic(() => import('./components/placementZoneSelector'), { ssr: false });

const Tabs = {
    PLACEMENT_ZONES: "placement_zones",
    PLAYING_ZONES: "playing_zones",
};

function ParametersTitle() {
    return (
        <div className='w-full bg-custom-light-blue gap-5 p-5 flex flex-row shadow-2xl'>
            <Link href="/admin">
                <Image src="/icons/backarrow.png" alt="cogwheel" className="w-8 h-8" title="Main page" />
            </Link>
            <h2 className="text-3xl font-bold">Paramètres</h2>
        </div>
    );
}

function TabButton({title, onClick, isSelected}) {
    const grayStyle = "bg-gray-300 hover:bg-gray-400";
    const blueStyle = "bg-custom-light-blue";

    return (
        <div className={`flex-1 h-full flex justify-center items-center  cursor-pointer ${isSelected ? blueStyle : grayStyle}`} onClick={onClick}>
            <p className="text-2xl font-bold">{title}</p>
        </div>
    );
}

export default function ParametersPage() {
    const { useProtect } = useAuth();
    const [currentTab, setCurrentTab] = useState(Tabs.PLACEMENT_ZONES);

    useProtect();

    return (
        <div className='w-full h-full p-3 flex flex-row gap-3'>
            <div className="h-full w-2/6 gap-3 flex flex-col">
                <ParametersTitle/>
                <TeamManager/>
            </div>
            <div className="h-full flex-1 flex flex-col bg-white shadow-2xl">
                <div className="w-full h-20 flex flex-row bg-gray-300">
                    <TabButton title="Zones de placement" onClick={() => setCurrentTab(Tabs.PLACEMENT_ZONES)} isSelected={currentTab == Tabs.PLACEMENT_ZONES}/>
                    <TabButton title="Zones de jeu" onClick={() => setCurrentTab(Tabs.PLAYING_ZONES)} isSelected={currentTab == Tabs.PLAYING_ZONES}/>
                </div>
                <div className="w-full flex-1 p-3 bg-white">
                    <PlacementZoneSelector display={currentTab == Tabs.PLACEMENT_ZONES} />
                    <PlayingZoneSelector display={currentTab == Tabs.PLAYING_ZONES} />
                </div>
            </div>
        </div>
    );
}
