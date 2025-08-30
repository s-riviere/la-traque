import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { List } from '@/components/list';
import useAdmin from '@/hook/useAdmin';

function reorder(list, startIndex, endIndex) {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
};

function TeamManagerItem({ team, index }) {
    const { updateTeam, removeTeam } = useAdmin();

    function handleRemove() {
        removeTeam(team.id);
    }

    return (
        <Draggable draggableId={team.id.toString()} index={index}>
            {provided => (
                <div className='w-full p-2 bg-white flex flex-row items-center text-xl gap-3 font-bold' {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
                    <div className='flex-1 w-full h-full flex flex-row items-center justify-between'>
                        <p>{team.name}</p>
                        <div className='flex flex-row items-center justify-between gap-3'>
                            <p>{String(team.id).padStart(6, '0').replace(/(\d{3})(\d{3})/, "$1 $2")}</p>
                            <img src={`/icons/heart/${team.captured ? "grey" : "pink"}.png`} className="w-8 h-8" onClick={() => updateTeam(team.id, { captured: !team.captured })} />
                            <img src="/icons/trash.png" className="w-8 h-8" onClick={handleRemove} />
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
}

export default function TeamManager() {
    const { teams, reorderTeams } = useAdmin();
    
    function onDragEnd(result) {
        if (!result.destination) return;
        if (result.destination.index === result.source.index) return;
        const newTeams = reorder(teams, result.source.index, result.destination.index);
        reorderTeams(newTeams);
    }

    return (
        <DragDropContext onDragEnd={onDragEnd} >
            <Droppable droppableId='team-list'>
                {provided => (
                    <div className='w-full h-full' ref={provided.innerRef} {...provided.droppableProps}>
                        <List array={teams}>
                            {(team, i) => (
                                <TeamManagerItem index={i} team={team}/>
                            )}
                        </List>
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
}
