// React
import { useMemo } from 'react';
import { Polygon } from 'react-native-maps';
// Components
import { DashedCircle, InvertedCircle, InvertedPolygon } from '@/components/common/Layers';
// Contexts
import { useTeam } from '@/contexts/teamContext';
// Constants
import { ZONE_TYPES } from '@/config';

export const StartZone = () => {
    const { teamStateData } = useTeam();
    const { placementZone } = teamStateData;

    return useMemo(() => {
        if (!placementZone) return null;

        return (
            <Polygon coordinates={placementZone} strokeWidth={2} strokeColor={`rgba(0, 0, 255, 1)`} fillColor={`rgba(0, 0, 255, 0.2)`} />
        );
    }, [placementZone]);
};

const latToLatitude = (pos) => ({latitude: pos.lat, longitude: pos.lng});

export const GameZone = () => {
    const { zoneType, zoneExtremities } = useTeam();
    
    return useMemo(() => {
        if (!zoneExtremities) return null;

        const items = [];
        
        const nextZoneStrokeColor = "rgb(90, 90, 90)";
        const zoneColor = "rgba(25, 83, 169, 0.4)";
        const strokeWidth = 3;
        const lineDashPattern = [30, 10];

        switch (zoneType) {
            case ZONE_TYPES.CIRCLE:
                if (zoneExtremities.begin) items.push(
                    <InvertedCircle
                        key="game-zone-begin-circle"
                        id="game-zone-begin-circle"
                        center={latToLatitude(zoneExtremities.begin.center)}
                        radius={zoneExtremities.begin.radius}
                        fillColor={zoneColor}
                    />
                );
                if (zoneExtremities.end) items.push(
                    <DashedCircle
                        key="game-zone-end-circle"
                        id="game-zone-end-circle"
                        center={latToLatitude(zoneExtremities.end.center)}
                        radius={zoneExtremities.end.radius}
                        strokeColor={nextZoneStrokeColor}
                        strokeWidth={strokeWidth}
                        lineDashPattern={lineDashPattern}
                    />
                );
                break;
            case ZONE_TYPES.POLYGON:
                if (zoneExtremities.begin) items.push(
                    <InvertedPolygon
                        key="game-zone-begin-poly"
                        id="game-zone-begin-poly"
                        coordinates={zoneExtremities.begin.polygon.map(pos => latToLatitude(pos))}
                        fillColor={zoneColor}
                    />
                );
                if (zoneExtremities.end) items.push(
                    <Polygon
                        key="game-zone-end-poly"
                        coordinates={zoneExtremities.end.polygon.map(pos => latToLatitude(pos))}
                        strokeColor={nextZoneStrokeColor}
                        strokeWidth={strokeWidth}
                        lineDashPattern={lineDashPattern}
                    />
                );
                break;
            default:
                return null;
        }

        return items.length ? items : null;
    }, [zoneType, zoneExtremities]);
};
