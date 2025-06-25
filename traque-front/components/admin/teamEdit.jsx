import React, { useEffect, useRef, useState } from 'react'
import { TextInput } from '../util/textInput'
import { BlueButton, RedButton } from '../util/button';
import useAdmin from '@/hook/useAdmin';
import dynamic from 'next/dynamic';
import { env } from 'next-runtime-env';
import { GameState } from '@/util/gameState';

// Imported at runtime and not at compile time
const PlacementMap = dynamic(() => import('./placementMap'), { ssr: false });

export default function TeamEdit({ selectedTeamId, setSelectedTeamId }) {
    const teamImage = useRef(null);
    const [avgSpeed, setAvgSpeed] = useState(0); // Speed in m/s
    const [newTeamName, setNewTeamName] = React.useState('');
    const { updateTeam, getTeamName, removeTeam, getTeam, teams, gameState, startDate } = useAdmin();
    const [team, setTeam] = useState({});
    const NEXT_PUBLIC_SOCKET_HOST = env("NEXT_PUBLIC_SOCKET_HOST");
    var protocol = "https://";
    if (NEXT_PUBLIC_SOCKET_HOST == "localhost") {
        protocol = "http://";
    }
    const SERVER_URL = protocol + NEXT_PUBLIC_SOCKET_HOST + "/back";
    console.log(SERVER_URL);

    useEffect(() => {
        let team = getTeam(selectedTeamId);
        if (team != undefined) {
            setNewTeamName(team.name);
            setTeam(team);
        }
        teamImage.current.src = SERVER_URL + "/photo/my?team=" + selectedTeamId + "&t=" + new Date().getTime();
    }, [selectedTeamId, teams])

    // Update the average speed
    useEffect(() => {
        const time = Math.floor((team.finishDate ? team.finishDate - startDate : Date.now() - startDate) / 1000);
        setAvgSpeed(team.distance/time);
    }, [team.distance, team.finishDate]);

    function handleRename(e) {
        e.preventDefault();
        updateTeam(team.id, { name: newTeamName });
    }

    function handleRemove() {
        removeTeam(team.id);
        setSelectedTeamId(null);
    }

    function handleAddPenalty(increment) {
        let newPenalties = team.penalties + increment;
        newPenalties = Math.max(0, newPenalties);
        newPenalties = Math.min(3, newPenalties);
        updateTeam(team.id, { penalties: newPenalties });
    }

    function formatTimeHours(time) {
        // time is in seconds
        if (!Number.isInteger(time)) return "Inconnue";
        if (time < 0) time = 0;
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return String(hours).padStart(2,"0") + ":" + String(minutes).padStart(2,"0") + ":" + String(seconds).padStart(2,"0");
    }

    return (team &&
        <div className='flex flex-row w-full h-full gap-2'>
            <div className='flex w-1/2 flex-col h-1/2 gap-2'>
                <h2 className='text-2xl text-center'>Actions</h2>
                <form className='flex flex-row' onSubmit={handleRename}>
                    <div className='w-4/5'>
                        <TextInput name="teamName" label='Team name' value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} />
                    </div>
                    <div className='w-2/5'>
                        <BlueButton type="submit">Rename</BlueButton>
                    </div>
                </form>
                <div className='flex flex-row'>
                    <BlueButton onClick={() => {updateTeam(team.id, { captured: !team.captured }); team.finishDate = Date.now()}}>{team.captured ? "Revive" : "Capture"}</BlueButton>
                    <RedButton onClick={handleRemove}>Remove</RedButton>
                </div>
                <p className='text-2xl text-center w-full'>Starting zone</p>
                <PlacementMap area={team.startingArea} setArea={(startingArea) => updateTeam(team.id, { startingArea })} markerPosition={team?.currentLocation} />
            </div>
            <div className='flex w-1/2 flex-col h-min gap-2 items-center'>
                <h2 className='text-2xl text-center'>Team details</h2>
                <div className='w-3/5'>
                    <img className='self-stretch' ref={teamImage} onError={(e) => {e.target.src = "/images/missing_image.jpg"}} />
                </div>
                <div className='flex flex-col gap-3'>
                    <div>
                        <p>Secret : {String(team.id).padStart(6, '0').replace(/(\d{3})(\d{3})/, '$1 $2')}</p>
                        <p>Capture code : {String(team.captureCode).padStart(4, '0')}</p>
                    </div>
                    <div>
                        <p>Chasing : {getTeamName(team.chasing)}</p>
                        <p>Chased by : {getTeamName(team.chased)}</p>
                    </div>
                    {gameState == GameState.PLAYING &&
                        <div>
                            <p>Distance: { (team.distance / 1000).toFixed(1) }km</p>
                            <p>Time : {formatTimeHours(Math.floor((team.finishDate ? team.finishDate - startDate : Date.now() - startDate) / 1000))}</p>
                            <p>Average speed : {(avgSpeed*3.6).toFixed(1)}km/h</p>
                            <p>Captures : {team.nCaptures}</p>
                            <p>Sent location : {team.nSentLocation}</p>
                            <p>Oberved : {team.nObserved}</p>
                        </div>
                    }
                    <div>
                        <p>Phone model : {team.phoneModel ?? "Unknown"}</p>
                        <p>Phone name : {team.phoneName ?? "Unknown"}</p>
                        <p>Battery: {team.battery ? team.battery + "%" : "Unknown"}</p>
                    </div>
                    <div className='flex flex-row'>
                        <p>Penalties :</p>
                        <button className='w-7 h-7 mx-4 bg-blue-600 hover:bg-blue-500 text-md ease-out duration-200 text-white shadow-sm rounded' onClick={() => handleAddPenalty(-1)}>-</button>
                        <p>{team.penalties}</p>
                        <button className='w-7 h-7 mx-4 bg-blue-600 hover:bg-blue-500 text-md ease-out duration-200 text-white shadow-sm rounded' onClick={() => handleAddPenalty(1)}>+</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
