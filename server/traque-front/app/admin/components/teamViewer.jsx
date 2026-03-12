import Image from 'next/image';
import { List } from '@/components/list';
import { getStatus } from '@/util/functions';
import { useEffect, useMemo, useState } from 'react';
import { useAdmin } from '@/context/adminContext';

function TeamViewerItem({ team }) {
    const { gameState } = useAdmin();
    const [dateNow, setDateNow] = useState(0);
    const status = getStatus(team, gameState);
    const NO_VALUE = "XX";
    
    useEffect(() => {
        const interval = setInterval(() => setDateNow(Date.now()), 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`w-full flex flex-row gap-3 p-2 ${team.captured ? 'bg-gray-200' : 'bg-white'} justify-between`}>
            <div className='flex flex-row items-center gap-3'>
                <div className='flex flex-row gap-1'>
                    <Image src={`/icons/user/${team.sockets.length > 0 ? "green" : "red"}.png`} alt="icon" className="w-4 h-4" />
                    <Image src={`/icons/battery/${team.battery >= 20 ? "green" : "red"}.png`} alt="icon" className="w-4 h-4" />
                    <Image src={`/icons/location/${team.lastCurrentLocationDate && (dateNow - team.lastCurrentLocationDate <= 30000) ? "green" : "red"}.png`} alt="icon" className="w-4 h-4" />
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

    // Uncaptured teams first
    const sortedTeams = useMemo(() => {
        return [...teams].sort((a,b) => {
            if (a.captured === b.captured) return 0;
            return a.captured ? 1 : -1;
        });
    }, [teams]);

    return (
        <List array={sortedTeams} selectedId={selectedTeamId} onSelected={onSelected} >
            {(team) => (
                <TeamViewerItem team={team}/>
            )}
        </List>
    );
}
