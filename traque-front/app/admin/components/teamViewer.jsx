import { List } from '@/components/list';
import useAdmin from '@/hook/useAdmin';
import { getStatus } from '@/util/functions';

function TeamViewerItem({ team }) {
    const { gameState } = useAdmin();
    const status = getStatus(team, gameState);
    const NO_VALUE = "XX";

    return (
        <div className={'w-full flex flex-row gap-3 p-2 bg-white justify-between'}>
            <div className='flex flex-row items-center gap-3'>
                <div className='flex flex-row gap-1'>
                    <img src={`/icons/user/${team.sockets.length > 0 ? "green" : "red"}.png`} className="w-4 h-4" />
                    <img src={`/icons/battery/${team.battery >= 20 ? "green" : "red"}.png`} className="w-4 h-4" />
                    <img src={`/icons/location/${team.lastCurrentLocationDate && (Date.now() - team.lastCurrentLocationDate <= 30000) ? "green" : "red"}.png`} className="w-4 h-4" />
                </div>
                <p className="text-xl font-bold">{team.name ?? NO_VALUE}</p>
            </div>
            <p className="text-xl font-bold" style={{color: status.color}}>
                {status.label}
            </p>
        </div>
    );
}

export default function TeamViewer({selectedTeamId, onSelected}) {
    const { teams } = useAdmin();

    return (
        <List array={teams} selectedId={selectedTeamId} onSelected={onSelected} >
            {(team) => (
                <TeamViewerItem team={team}/>
            )}
        </List>
    );
}
