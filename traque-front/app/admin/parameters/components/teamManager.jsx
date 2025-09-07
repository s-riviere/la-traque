import { useState } from "react";
import { ReorderList } from '@/components/list';
import useAdmin from '@/hook/useAdmin';
import useLocalVariable from "@/hook/useLocalVariable";
import { TextInput } from "@/components/input";
import { Section } from "@/components/section";

function TeamManagerItem({ team }) {
    const { captureTeam, removeTeam } = useAdmin();

    return (
        <div className='w-full flex flex-row items-center justify-between p-2 gap-3 bg-white'>
            <p className='text-xl font-bold'>{team.name}</p>
            <div className='flex flex-row items-center justify-between gap-3'>
                <p className='text-xl font-bold'>{String(team.id).padStart(6, '0').replace(/(\d{3})(\d{3})/, "$1 $2")}</p>
                <img src={`/icons/heart/${team.captured ? "grey" : "pink"}.png`} className="w-8 h-8 cursor-pointer" onClick={() => captureTeam(team.id)} />
                <img src="/icons/trash.png" className="w-8 h-8 cursor-pointer" onClick={() => removeTeam(team.id)} />
            </div>
        </div>
    );
}

export default function TeamManager() {
    const { teams, addTeam, reorderTeams, sendPositionDelay, updateSettings } = useAdmin();
    const [teamName, setTeamName] = useState('');
    const [localSendPositionDelay, setLocalSendPositionDelay, applyLocalSendPositionDelay] = useLocalVariable(sendPositionDelay, (e) => updateSettings({sendPositionDelay: e}));
    
    function handleTeamSubmit(e) {
        e.preventDefault();
        if (teamName !== "") {
            addTeam(teamName);
            setTeamName("")
        }
    }

    return (
        <Section title="Équipe" outerClassName="flex-1 min-h-0" innerClassName="flex flex-col items-center gap-3">
            <form className='w-full flex flex-row gap-3' onSubmit={handleTeamSubmit}>
                <div className='w-full'>
                    <input name="teamName" label='Team name' value={teamName} onChange={(e) => setTeamName(e.target.value)} type="text" className="w-full h-full p-4 ring-1 ring-inset ring-gray-300" />
                </div>
                <div className='w-1/5'>
                    <button type="submit" className="w-full h-full bg-custom-light-blue hover:bg-blue-500 transition text-3xl font-bold">+</button>
                </div>
            </form>
            <div className="w-full flex-1 min-h-0 ">
                <ReorderList droppableId="team-manager" array={teams} setArray={(teams) => reorderTeams(teams.map(team => team.id))}>
                    {(team) => (
                        <TeamManagerItem team={team}/>
                    )}
                </ReorderList>
            </div>
            <div className="w-full flex flex-row gap-2 items-center justify-between">
                <p>Interval between position updates</p>
                <div className="w-16 h-10">
                    <TextInput id="position-update" value={localSendPositionDelay ?? ""} onChange={(e) => setLocalSendPositionDelay(parseInt(e.target.value, 10))} onBlur={applyLocalSendPositionDelay} />
                </div>
            </div>
        </Section>
    );
}
