import useAdmin from '@/hook/useAdmin';
import { GameState } from '@/util/gameState';

const TEAM_STATUS = {
    playing:    { label: "En jeu",          color: "text-custom-green" },
    captured:   { label: "Capturée",        color: "text-custom-red" },
    outofzone:  { label: "Hors zone",       color: "text-custom-orange" },
    ready:      { label: "Placée",          color: "text-custom-green" },
    notready:   { label: "Non placée",      color: "text-custom-red" },
    waiting:    { label: "En attente",      color: "text-custom-grey" },
};

function getStatus(team, gamestate) {
    switch (gamestate) {
        case GameState.SETUP:
            return TEAM_STATUS.waiting;
        case GameState.PLACEMENT:
            return team.ready ? TEAM_STATUS.ready : TEAM_STATUS.notready;
        case GameState.PLAYING:
            return team.captured ? TEAM_STATUS.captured : team.outofzone ? TEAM_STATUS.outofzone : TEAM_STATUS.playing;
        case GameState.FINISHED:
            return team.captured ? TEAM_STATUS.captured : TEAM_STATUS.playing;
    }
}

function TeamListItem({ itemSelected, team }) {
    const { gameState } = useAdmin();
    const status = getStatus(team, gameState);

    return (
        <div className={'w-full p-2 bg-white flex flex-row gap-3 justify-between cursor-pointer' + (itemSelected ? " outline outline-4 outline-black" : "")}>
            <div className='flex flex-row items-center gap-3'>
                <div className='flex flex-row gap-1'>
                    <img src={team.sockets.length > 0 ? "/icons/greendude.png" : "/icons/reddude.png"} className="w-4 h-4" />
                    <img src={team.battery > 20 ? "/icons/greenbattery.png" : "/icons/redbattery.png"} className="w-4 h-4" />
                    <img src={team.lastCurrentLocationDate != null && (Date.now() - team.lastCurrentLocationDate <= 30000) ? "/icons/greenlocation.png" : "/icons/redlocation.png"} className="w-4 h-4" />
                </div>
                <p className={`text-xl font-bold`}>{team.name}</p>
            </div>
            <p className={`text-xl font-bold ${status.color}`}>
                {status.label}
            </p>
        </div>
    );
}

export default function TeamList({selectedTeamId, onSelected}) {
    const { teams } = useAdmin();

    return (
        <ul className='h-full gap-1 flex flex-col'>
            {teams.map((team) => (
                <li key={team.id} onClick={() => onSelected(team.id)}>
                    <TeamListItem itemSelected={selectedTeamId === team.id} team={team} />
                </li>
            ))}
        </ul>
    );
}
