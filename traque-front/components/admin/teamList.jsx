import useAdmin from '@/hook/useAdmin';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import React from 'react'

function reorder(list, startIndex, endIndex) {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
};

function TeamListItem({ team, index, onSelected, itemSelected }) {
    const bgColor = team.captured ? " bg-red-400" : " bg-gray-300";
    const border = " border border-4 " + (itemSelected ? "border-black" : team.captured ? "border-red-400" : "border-gray-300");
    const classNames = 'w-full p-3 my-3' + (bgColor) + (border);
    return (
        <Draggable draggableId={team.id.toString()} index={index} onClick={() => onSelected(team.id)}>
            {provided => (
                <div className={classNames} {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
                    <p className='text-center'>{team.name}</p>
                </div>

            )}
        </Draggable>
    );
}

export default function TeamList({selectedTeamId, onSelected}) {
    const {teams, reorderTeams} = useAdmin();

    function onDragEnd(result) {
        if (!result.destination) {
            return;
        }

        if (result.destination.index === result.source.index) {
            return;
        }

        const newTeams = reorder(
            teams,
            result.source.index,
            result.destination.index
        );

        reorderTeams(newTeams);
    }

    return (
        <DragDropContext onDragEnd={onDragEnd} >
            <Droppable droppableId='team-list'>
                {provided => (
                    <ul  ref={provided.innerRef} {...provided.droppableProps}>
                        {teams.map((team, i) => (
                            <li key={team.id} onClick={() => onSelected(team.id)}>
                                <TeamListItem onSelected={onSelected} index={i} itemSelected={selectedTeamId === team.id} team={team} />
                            </li>
                        ))}
                        {provided.placeholder}
                    </ul>
                )}
            </Droppable>
        </DragDropContext>
    );
}
