import React, { useState } from 'react'
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import useAdmin from '@/hook/useAdmin';

function reorder(list, startIndex, endIndex) {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
};

function TeamListItem({ team, index }) {
    const { removeTeam } = useAdmin();

    function handleRemove() {
        removeTeam(team.id);
    }

    return (
        <Draggable draggableId={team.id.toString()} index={index} onClick={() => onSelected(team.id)}>
            {provided => (
                <div className='w-full p-2 bg-white flex flex-row items-center text-xl gap-3 font-bold' {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
                    <div className='flex-1 w-full h-full flex flex-row items-center justify-between'>
                        <p>{team.name}</p>
                        <div className='flex flex-row items-center justify-between gap-3'>
                            <p>{String(team.id).padStart(6, '0').replace(/(\d{3})(\d{3})/, "$1 $2")}</p>
                            <img src="/icons/home.png" className="w-8 h-8" />
                            <img src="/icons/home.png" className="w-8 h-8" onClick={handleRemove} />
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
}

export default function TeamList() {
    const { teams, reorderTeams, addTeam } = useAdmin();
    const [teamName, setTeamName] = useState('');
    
    function handleSubmit(e) {
        e.preventDefault();
        if (teamName !== "") {
            addTeam(teamName);
            setTeamName("")
        }
    }
    
    function onDragEnd(result) {
        if (!result.destination) return;
        if (result.destination.index === result.source.index) return;
        const newTeams = reorder(teams, result.source.index, result.destination.index);
        reorderTeams(newTeams);
    }

    return (
        <div className='w-full h-full flex flex-col gap-3'>
            <form className='w-full flex flex-row gap-3' onSubmit={handleSubmit}>
                <div className='w-full'>
                    <input name="teamName" label='Team name' value={teamName} onChange={(e) => setTeamName(e.target.value)} type="text" className="w-full h-full p-4 ring-1 ring-inset ring-gray-300" />
                </div>
                <div className='w-1/5'>
                    <button type="submit" className="w-full h-full bg-custom-light-blue hover:bg-blue-500 transition text-3xl font-bold">+</button>
                </div>
            </form>
            <DragDropContext onDragEnd={onDragEnd} >
                <Droppable droppableId='team-list'>
                    {provided => (
                        <ul className='w-full h-full gap-1 flex flex-col bg-gray-300 p-1' ref={provided.innerRef} {...provided.droppableProps}>
                            {teams.map((team, i) => (
                                <li key={team.id}>
                                    <TeamListItem index={i} team={team} />
                                </li>
                            ))}
                            {provided.placeholder}
                        </ul>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
}
