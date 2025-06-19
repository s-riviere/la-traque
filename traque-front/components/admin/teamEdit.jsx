import React, { useEffect, useRef, useState } from 'react'
import TextInput from '../util/textInput'
import BlueButton, { RedButton } from '../util/button';
import useAdmin from '@/hook/useAdmin';
import dynamic from 'next/dynamic';

import { env } from 'next-runtime-env';

const CircularAreaPicker = dynamic(() => import('./mapPicker').then((mod) => mod.CircularAreaPicker), {
    ssr: false
});

export default function TeamEdit({ selectedTeamId, setSelectedTeamId }) {
    const teamImage = useRef(null);
    const [newTeamName, setNewTeamName] = React.useState('');
    const { updateTeam, getTeamName, removeTeam, getTeam, teams } = useAdmin();
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

    return (team &&
        <div className='flex flex-col w-full h-full'>
            <div className='flex flex-row gap-2'>
                <div className='flex w-1/2 flex-col gap-2 h-min self-start'>
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
                        <BlueButton onClick={() => updateTeam(team.id, { captured: !team.captured })}>{team.captured ? "Revive" : "Capture"}</BlueButton>
                        <RedButton onClick={handleRemove}>Remove</RedButton>
                    </div>
                </div>
                <div className='flex w-1/2 flex-col space-y-2 h-min self-start'>
                    <h2 className='text-2xl text-center'>Team details</h2>
                    <div>
                        <p>Secret : {String(team.id).padStart(6, '0').replace(/(\d{3})(\d{3})/, '$1 $2')}</p>
                        <p>Capture code : {String(team.captureCode).padStart(4, '0')}</p>
                        <p>Chasing : {getTeamName(team.chasing)}</p>
                        <p>Chased by : {getTeamName(team.chased)}</p>
                        <div className='flex flex-row'>
                            <p>Penalties :</p>
                            <button className='w-7 h-7 mx-4 bg-blue-600 hover:bg-blue-500 text-md ease-out duration-200 text-white shadow-sm rounded' onClick={() => handleAddPenalty(-1)}>-</button>
                            <p>{team.penalties}</p>
                            <button className='w-7 h-7 mx-4 bg-blue-600 hover:bg-blue-500 text-md ease-out duration-200 text-white shadow-sm rounded' onClick={() => handleAddPenalty(1)}>+</button>
                        </div>
                        <br/>
                    </div>
                </div>
            </div>
            <div className='flex flex-row'>
                <p className='text-2xl text-center w-full'>Starting zone</p>
                <p className='text-2xl text-center w-full'>Profile picture</p>
            </div>
            <div className='flex grow flex-row'>
                <div className='w-1/2'>
                    <CircularAreaPicker area={team.startingArea} setArea={(startingArea) => updateTeam(team.id, { startingArea })} markerPosition={team?.currentLocation} />
                </div>
                <div className='w-1/2'>
                    <img className='self-stretch' ref={teamImage} onError={(e) => {e.target.src = "/images/missing_image.jpg"}} />
                </div>
            </div>
        </div>
    )
}
