import { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';

export function List({array, selectedId, onSelected, children}) {
    const canSelect = selectedId !== undefined;
    const cursor = () => canSelect ? " cursor-pointer" : "";
    const outline = (id) => canSelect && id === selectedId ? " outline outline-4 outline-black" : "";

    return (
        <div className='w-full h-full bg-gray-300 overflow-y-scroll'>
            <ul className="w-full p-1 pb-0">
                {array?.map((elem, i) => (
                    <li className="w-full" key={elem.id}>
                        <div className={"w-full" + cursor() + outline(elem.id)} onClick={() => canSelect && onSelected(elem.id)}>
                            {children(elem, i)}
                        </div>
                        <div className="w-full h-1"/>
                    </li>
                )) ?? null}
            </ul>
        </div>
    );
}

export function ReorderList({droppableId, array, setArray, children}) {
    const [localArray, setLocalArray] = useState(array);

    useEffect(() => {
        setLocalArray(array);
    }, [array]);

    function reorder(list, startIndex, endIndex) {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    }
    
    function onDragEnd(result) {
        if (!result.destination) return;
        if (result.destination.index === result.source.index) return;
        const newArray = reorder(array, result.source.index, result.destination.index);
        setLocalArray(newArray);
        setArray(newArray);
    }

    return (
        <DragDropContext onDragEnd={onDragEnd} >
            <Droppable droppableId={droppableId}>
                {provided => (
                    <div className='w-full h-full bg-gray-300 overflow-y-scroll' ref={provided.innerRef} {...provided.droppableProps}>
                        <ul className="w-full p-1 pb-0">
                            {localArray?.map((elem, i) => (
                                <li className='w-full' key={elem.id}>
                                    <Draggable draggableId={elem.id.toString()} index={i}>
                                        {provided => (
                                            <div className='w-full cursor-grab' {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
                                                {children(elem, i)}
                                                <div className="w-full h-1"/>
                                            </div>
                                        )}
                                    </Draggable>
                                </li>
                            )) ?? null}
                        </ul>
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
}
