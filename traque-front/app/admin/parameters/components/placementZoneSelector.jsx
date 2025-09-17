import { useEffect, useState } from "react";
import { List } from "@/components/list";
import { CustomMapContainer, MapEventListener } from "@/components/map";
import useAdmin from '@/hook/useAdmin';
import useMultipleCircleDraw from "@/hook/useMultipleCircleDraw";
import { CircleZone, Tag } from "@/components/layer";

function Drawings({ placementZones, addZone, removeZone, handleRightClick }) {
    const { handleLeftClick, handleRightClick: handleRightClickDrawing } = useMultipleCircleDraw(placementZones, addZone, removeZone, 30);

    function modifiedHandleRightClick(e) {
        handleRightClickDrawing(e);
        handleRightClick();
    }

    return (<>
        <MapEventListener onLeftClick={handleLeftClick} onRightClick={modifiedHandleRightClick} />
        { placementZones.map(placementZone =>
            <CircleZone key={placementZone.id} circle={placementZone} color="blue">
                <Tag text={placementZone.name} />
            </CircleZone>
        )}
    </>);
}

export default function PlacementZoneSelector({ display }) {
    const { teams, getTeam, placementTeam } = useAdmin();
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const [placementZones, setPlacementZones] = useState([]);

    useEffect(() => {
        setPlacementZones(teams.filter(team => team.startingArea).map(team => ({id: team.id, name: team.name, center: team.startingArea.center, radius: team.startingArea.radius})));
    }, [teams]);

    function addPlacementZone(center, radius) {
        if (!selectedTeamId) return;
        const placementZonesFiltered = placementZones.filter(placementZone => placementZone.id !== selectedTeamId);
        const newZone = {id: selectedTeamId, name: getTeam(selectedTeamId).name, center: center, radius: radius};
        placementTeam(selectedTeamId, newZone);
        setPlacementZones([...placementZonesFiltered, newZone]);
    }

    function removePlacementZone(id) {
        placementTeam(id, null);
        setPlacementZones(placementZones.filter((placementZone) => placementZone.id !== id));
    }

    return (
        <div className={display ? 'w-full h-full gap-3 flex flex-row' : "hidden"}>
            <div className="h-full flex-1">
                <CustomMapContainer>
                    <Drawings placementZones={placementZones} addZone={addPlacementZone} removeZone={removePlacementZone} handleRightClick={() => setSelectedTeamId(null)} />
                </CustomMapContainer>
            </div>
            <div className="h-full w-1/6 flex flex-col gap-3">
                <div className="w-full text-center">
                    <h2 className="text-xl">Équipes</h2>
                </div>
                <List array={teams} selectedId={selectedTeamId} onSelected={(id) => setSelectedTeamId(selectedTeamId != id ? id : null)}>
                    { (team) =>
                        <div key={team.id} className="w-full flex flex-row items-center justify-between gap-2 p-2 bg-white">
                            <p className='text-xl font-bold'>{team.name}</p>
                        </div>
                    }
                </List>
            </div>
        </div>
    );
}
