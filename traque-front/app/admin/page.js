"use client";
import { useState } from 'react';
import dynamic from "next/dynamic";
import Link from "next/link";
import { Section } from "@/components/section";
import { useAdminConnexion } from "@/context/adminConnexionContext";
import useAdmin from "@/hook/useAdmin";
import { GameState } from "@/util/types";
import { mapStyles } from '@/util/configurations';
import TeamSidePanel from "./components/teamSidePanel";
import TeamViewer from './components/teamViewer';
import { MapButton, ControlButton } from './components/buttons';

// Imported at runtime and not at compile time
const LiveMap = dynamic(() => import('./components/liveMap'), { ssr: false });

export default function AdminPage() {
    const { useProtect } = useAdminConnexion();
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const { changeState, getTeam } = useAdmin();
    const [mapStyle, setMapStyle] = useState(mapStyles.default);
    const [showZones, setShowZones] = useState(true);
    const [showNames, setShowNames] = useState(true);
    const [showArrows, setShowArrows] = useState(false);
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
        <div className='h-full bg-gray-200 p-3 flex flex-row content-start gap-3'>
            <div className="h-full w-2/6 flex flex-col gap-3">
                <div className='w-full bg-custom-light-blue gap-5 p-5 flex flex-row shadow-2xl'>
                    <img src="/icons/home.png" className="w-8 h-8" />
                    <h2 className="text-3xl font-bold">Page principale</h2>
                </div>
                <Section title="Contrôle" innerClassName='flex flex-row justify-between'>
                    <Link href="/admin/parameters">
                        <ControlButton icon="parameters" title="Accéder aux paramètres du jeu"/>
                    </Link>
                    {false && <ControlButton icon="play" title="Reprendre la partie" onClick={() => {}} />}
                    <ControlButton icon="reset" title="Réinitialiser la partie" onClick={() => changeState(GameState.SETUP)} />
                    <ControlButton icon="placement" title="Commencer les placements" onClick={() => changeState(GameState.PLACEMENT)} />
                    <ControlButton icon="begin" title="Lancer la traque" onClick={() => changeState(GameState.PLAYING)} />
                </Section>
                <Section title="Équipes" outerClassName="flex-1 min-h-0">
                    <TeamViewer selectedTeamId={selectedTeamId} onSelected={onSelected}/>
                </Section>
            </div>
            <div className='grow flex-1 flex flex-col bg-white p-3 gap-3 shadow-2xl'>
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
                    {false && <MapButton icon="incertitude" title="Afficher/masquer les incertitudes de position"/>}
                    {false && <MapButton icon="path" title="Afficher/masquer la trace de l'équipe sélectionnée"/>}
                    {false && <MapButton icon="informations" title="Afficher/masquer les évènements de l'équipe sélectionnée"/>}
                </div>
            </div>
        </div>
    )
}
