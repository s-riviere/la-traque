"use client";
import useAdmin from '@/hook/useAdmin';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import React from 'react'

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

function TeamListItem({ team, index, onSelected, itemSelected }) {;
    return (
        <Draggable draggableId={team.id.toString()} index={index} onClick={() => onSelected(team.id)}>
            {provided => (
                <div className='w-full p-2 bg-white border-2 border-gray-300 flex flex-row items-center text-3xl gap-3 font-bold' {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
                    <div className="w-12 h-12 grid grid-cols-2 grid-rows-2 gap-1">
                        <img src="/icons/greendude.png" className="w-6 h-6 object-contain" />
                        <img src="/icons/greenlocation.png" className="w-6 h-6 object-contain" />
                        <img src="/icons/greenconnection.png" className="w-6 h-6 object-contain" />
                        <img src="/icons/greenbattery.png" className="w-6 h-6 object-contain" />
                    </div>
                    <div className='flex-1 w-full h-full flex flex-row items-center justify-between'>
                        <p className='text-center'>{team.name}</p>
                        <p className={`text-center ${team.state === "En jeu" ? "text-green-600" : "text-red-600"}`}>
                            {team.state === team.captured ? "En jeu" : "Capturé"}
                        </p>
                    </div>
                </div>

            )}
        </Draggable>
    )
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
    )
}
