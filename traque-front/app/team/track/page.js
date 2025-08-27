"use client";
import React from 'react';
import dynamic from 'next/dynamic';
import { LogoutButton } from '@/components/button';
import { useSocket } from '@/context/socketContext';
import { useTeamConnexion } from '@/context/teamConnexionContext';
import { useTeamContext } from '@/context/teamContext';
import useGame from '@/hook/useGame';
import { GameState } from '@/util/gameState';
import ActionDrawer from './components/actionDrawer';
import Notification from './components/notification';
import PlacementOverlay from './components/placementOverlay';
import WaitingScreen from './components/waitingScreen';

//Load the map without SSR
const LiveMap = dynamic(() => import('./components/map').then((mod) => mod.LiveMap), {
    ssr: false
});
const PlacementMap = dynamic(() => import('./components/map').then((mod) => mod.PlacementMap), {
    ssr: false
});

export default function Track() {
    const { gameState, captured  } = useGame();
    const { gameSettings} = useTeamContext()
    const { useProtect } = useTeamConnexion();
    const { teamSocket: socket } = useSocket();
    useProtect();
    return <>
        <Notification socket={socket} />
        {gameState == GameState.SETUP && <WaitingScreen />}
        {gameState == GameState.PLAYING && !captured && <div className='h-full'>
            <LiveMap />
            <ActionDrawer />
        </div>
        }
        {gameState == GameState.PLAYING && captured && <div className='h-full'>
            <div className='text-center text-2xl'>Vous avez été capturé</div>
            <div className='text-center text-md'>{gameSettings?.capturedMessage}</div>
        </div>}
        {gameState == GameState.PLACEMENT &&
            <div className='h-full'>
                <PlacementOverlay />
                <PlacementMap />
            </div>
        }
        {gameState == GameState.FINISHED && <div className='h-full'>
            <LogoutButton />
            <div className='text-center text-2xl'>Partie terminée</div>
            {captured && <div className='text-center text-md'>{gameSettings?.loserEndGameMessage}</div>}
            {!captured && <div className='text-center text-md'>{gameSettings?.winnerEndGameMessage}</div>}
        </div>
        }
    </>
}
