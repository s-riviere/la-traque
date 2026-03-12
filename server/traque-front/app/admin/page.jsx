"use client";
import { useState } from 'react';
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { Section } from "@/components/section";
import { useAuth } from "@/context/authContext";
import { useAdmin } from '@/context/adminContext';
import { GameState } from "@/config/types";
import { mapStyles } from '@/config/configurations';
import TeamSidePanel from "./components/teamSidePanel";
import TeamViewer from './components/teamViewer';
import { emitState } from '@/services/socket/emitters';

// Imported at runtime and not at compile time
const LiveMap = dynamic(() => import('./components/liveMap'), { ssr: false });

function MainTitle() {
    return (
        <div className='w-full bg-custom-light-blue gap-5 p-5 flex flex-row shadow-2xl'>
            <Image src="/icons/home.png" alt="home" className="w-8 h-8" />
            <h2 className="text-3xl font-bold">Page principale</h2>
        </div>
    );
}

function MapButton({ icon, ...props }) {
    return (
        <button className="w-16 h-16 bg-custom-light-blue rounded-full hover:bg-blue-500 transition flex items-center justify-center" {...props}>
            <Image src={`/icons/${icon}.png`} alt="map-button" className="w-10 h-10" />
        </button>
    );
}

function ControlButton({ icon, ...props }) {
    return (
        <button className="w-[4.5rem] h-[4.5rem] bg-custom-light-blue rounded-lg hover:bg-blue-500 transition flex items-center justify-center" {...props}>
            <Image src={`/icons/${icon}.png`} alt="control-button" className="w-10 h-10" />
        </button>
    );
}

export default function AdminPage() {
    const { useProtect } = useAuth();
    const { getTeam } = useAdmin();
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const [mapStyle, setMapStyle] = useState(mapStyles.default);
    const [showZones, setShowZones] = useState(true);
    const [showNames, setShowNames] = useState(true);
    const [showArrows, setShowArrows] = useState(true);
    const [isFocusing, setIsFocusing] = useState(true);

    useProtect();

    function onSelected(id) {
        if (selectedTeamId == id && (!getTeam(id)?.currentLocation || isFocusing)) {
            setSelectedTeamId(null);
            setIsFocusing(false);
        } else {
            setSelectedTeamId(id);
            setIsFocusing(true);
        }
    }

    function switchMapStyle() {
        setMapStyle(mapStyle == mapStyles.default ? mapStyles.satellite : mapStyles.default);
    }

    function switchZones() {
        setShowZones(!showZones);
    }

    function switchNames() {
        setShowNames(!showNames);
    }

    function switchArrows() {
        setShowArrows(!showArrows);
    }
    
    return (
        <div className='w-full h-full p-3 flex flex-row gap-3'>
            <div className="h-full w-2/6 flex flex-col gap-3">
                <MainTitle/>
                <Section title="Contrôle" innerClassName='flex flex-row justify-between'>
                    <Link href="/admin/parameters">
                        <ControlButton icon="parameters" title="Accéder aux paramètres du jeu"/>
                    </Link>
                    <ControlButton icon="reset" title="Réinitialiser la partie" onClick={() => emitState(GameState.SETUP)} />
                    <ControlButton icon="placement" title="Commencer les placements" onClick={() => emitState(GameState.PLACEMENT)} />
                    <ControlButton icon="begin" title="Lancer la traque" onClick={() => emitState(GameState.PLAYING)} />
                </Section>
                <Section title="Équipes" outerClassName="flex-1 min-h-0">
                    <TeamViewer selectedTeamId={selectedTeamId} onSelected={onSelected}/>
                </Section>
            </div>
            <Section outerClassName='h-full flex-1' innerClassName='flex flex-col gap-3'>
                <div className="flex-1 flex flex-row gap-3">
                    <div className="flex-1 h-full">
                        <LiveMap
                            selectedTeamId={selectedTeamId}
                            onSelected={onSelected}
                            isFocusing={isFocusing}
                            setIsFocusing={setIsFocusing}
                            mapStyle={mapStyle}
                            showZones={showZones}
                            showNames={showNames}
                            showArrows={showArrows}
                        />
                    </div>
                    {selectedTeamId &&
                        <div className="w-3/12 h-full">
                            <TeamSidePanel selectedTeamId={selectedTeamId} onClose={() => setSelectedTeamId(null)}/>
                        </div>
                    }
                </div>
                <div className='w-full flex flex-row items-center justify-evenly py-2'>
                    <MapButton icon="mapstyle" title="Changer le style de la carte" onClick={switchMapStyle}/>
                    <MapButton icon="zones" title="Afficher/masquer les zones" onClick={switchZones}/>
                    <MapButton icon="names" title="Afficher/masquer les noms des équipes" onClick={switchNames}/>
                    <MapButton icon="arrows" title="Afficher/masquer les relations de traque" onClick={switchArrows}/>
                </div>
            </Section>
        </div>
    );
}
