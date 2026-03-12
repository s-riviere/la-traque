import { useState } from "react";
import Image from "next/image";
import { ReorderList } from '@/components/list';
import useLocalVariable from "@/hook/useLocalVariable";
import { NumberInput } from "@/components/input";
import { Section } from "@/components/section";
import { useAdmin } from "@/context/adminContext";
import { emitAddTeam, emitEliminateTeam, emitRemoveTeam, emitReorderTeam, emitReviveTeam, emitSettings } from "@/services/socket/emitters";

function TeamManagerItem({ team }) {

    return (
        <div className='w-full flex flex-row items-center justify-between p-2 gap-3 bg-white'>
            <p className='text-xl font-bold'>{team.name}</p>
            <div className='flex flex-row items-center justify-between gap-3'>
                <p className='text-xl font-bold'>{String(team.id).padStart(6, '0').replace(/(\d{3})(\d{3})/, "$1 $2")}</p>
                <Image src={`/icons/heart/${team.captured ? "grey" : "pink"}.png`} alt="heart" className="w-8 h-8 cursor-pointer" onClick={() => team.captured ? emitReviveTeam(team.id) : emitEliminateTeam(team.id)} />
                <Image src="/icons/trash.png" alt="trash" className="w-8 h-8 cursor-pointer" onClick={() => emitRemoveTeam(team.id)} />
            </div>
        </div>
    );
}

export default function TeamManager() {
    const { teams, settings } = useAdmin();
    const [teamName, setTeamName] = useState('');
    const [localSendPositionDelay, setLocalSendPositionDelay, applyLocalSendPositionDelay] = useLocalVariable(settings.scanDelay, (e) => emitSettings({...settings, scanDelay: e}));
    
    function handleTeamSubmit(e) {
        e.preventDefault();
        if (teamName !== "") {
            emitAddTeam(teamName);
            setTeamName("");
        }
    }

    return (
        <Section title="Équipes" outerClassName="flex-1 min-h-0" innerClassName="flex flex-col items-center gap-3">
            <form className='w-full flex flex-row gap-3' onSubmit={handleTeamSubmit}>
                <div className='w-full'>
                    <input name="teamName" value={teamName} onChange={(e) => setTeamName(e.target.value)} type="text" className="w-full h-full p-4 ring-1 ring-inset ring-gray-300" />
                </div>
                <div className='w-1/5'>
                    <button type="submit" className="w-full h-full bg-custom-light-blue hover:bg-blue-500 transition text-3xl font-bold">+</button>
                </div>
            </form>
            <div className="w-full flex-1 min-h-0 ">
                <ReorderList droppableId="team-manager" array={teams} setArray={(teams) => emitReorderTeam(teams.map(team => team.id))}>
                    {(team) => (
                        <TeamManagerItem team={team}/>
                    )}
                </ReorderList>
            </div>
            <div className="w-full flex flex-row gap-2 items-center justify-between">
                <p>Intervalle entre les envois de position</p>
                <NumberInput id="position-update" value={localSendPositionDelay ?? ""} onChange={setLocalSendPositionDelay} onBlur={applyLocalSendPositionDelay} />
            </div>
        </Section>
    );
}
