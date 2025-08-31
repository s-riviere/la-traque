import { ReorderList } from '@/components/list';
import useAdmin from '@/hook/useAdmin';

function TeamManagerItem({ team }) {
    const { updateTeam, removeTeam } = useAdmin();

    function handleRemove() {
        removeTeam(team.id);
    }

    return (
        <div className='w-full p-2 bg-white flex flex-row items-center text-xl gap-3 font-bold'>
            <div className='flex-1 w-full h-full flex flex-row items-center justify-between'>
                <p>{team.name}</p>
                <div className='flex flex-row items-center justify-between gap-3'>
                    <p>{String(team.id).padStart(6, '0').replace(/(\d{3})(\d{3})/, "$1 $2")}</p>
                    <img src={`/icons/heart/${team.captured ? "grey" : "pink"}.png`} className="w-8 h-8" onClick={() => updateTeam(team.id, { captured: !team.captured })} />
                    <img src="/icons/trash.png" className="w-8 h-8" onClick={handleRemove} />
                </div>
            </div>
        </div>
    );
}

export default function TeamManager() {
    const { teams, reorderTeams } = useAdmin();

    return (
        <ReorderList droppableId="team-manager" array={teams} setArray={reorderTeams}>
            {(team) => (
                <TeamManagerItem team={team}/>
            )}
        </ReorderList>
    );
}
