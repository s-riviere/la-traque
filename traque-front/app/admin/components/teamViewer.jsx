import { List } from '@/components/list';
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

function TeamViewerItem({ team, itemSelected, onSelected }) {
    const { gameState } = useAdmin();
    const status = getStatus(team, gameState);

    return (
        <div className={'w-full flex flex-row gap-3 p-2 bg-white justify-between cursor-pointer ' + (itemSelected ? "outline outline-4 outline-black" : "")} onClick={() => onSelected(team.id)}>
            <div className='flex flex-row items-center gap-3'>
                <div className='flex flex-row gap-1'>
                    <img src={`/icons/user/${team.sockets.length > 0 ? "green" : "red"}.png`} className="w-4 h-4" />
                    <img src={`/icons/battery/${team.battery >= 20 ? "green" : "red"}.png`} className="w-4 h-4" />
                    <img src={`/icons/location/${team.lastCurrentLocationDate != null && (Date.now() - team.lastCurrentLocationDate <= 30000) ? "green" : "red"}.png`} className="w-4 h-4" />
                </div>
                <p className={`text-xl font-bold`}>{team.name}</p>
            </div>
            <p className={`text-xl font-bold ${status.color}`}>
                {status.label}
            </p>
        </div>
    );
}

export default function TeamViewer({selectedTeamId, onSelected}) {
    const { teams } = useAdmin();

    return (
        <List array={teams}>
            {(team) => (
                <TeamViewerItem team={team} itemSelected={selectedTeamId === team.id} onSelected={onSelected}/>
            )}
        </List>
    );
}
