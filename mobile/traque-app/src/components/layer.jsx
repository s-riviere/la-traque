// React
import { Fragment } from 'react';
import { Polygon } from 'react-native-maps';
import { circleToPolygon } from '../utils/functions';

export const InvertedPolygon = ({id, coordinates, fillColor}) => {
    // We create 3 rectangles covering earth, with the first rectangle centered on the hole
    const shift = Math.floor(coordinates[0].longitude);
    const lat = 85;
    const lon = 60;
    const worldOuterBounds1 = [
        { latitude: -lat, longitude: -lon + shift },
        { latitude: -lat, longitude: lon + shift },
        { latitude: lat, longitude: lon + shift },
        { latitude: lat, longitude: -lon + shift },
    ];
    const worldOuterBounds2 = [
        { latitude: -lat, longitude: -lon + 120 + shift },
        { latitude: -lat, longitude: lon + 120 + shift },
        { latitude: lat, longitude: lon + 120 + shift },
        { latitude: lat, longitude: -lon + 120 + shift },
    ];
    const worldOuterBounds3 = [
        { latitude: -lat, longitude: -lon + 240 + shift },
        { latitude: -lat, longitude: lon + 240 + shift },
        { latitude: lat, longitude: lon + 240 + shift },
        { latitude: lat, longitude: -lon + 240 + shift },
    ];

    return <Fragment>
        <Polygon
            key={`${id}-mask-1`}
            geodesic={true}
            holes={[coordinates]}
            coordinates={worldOuterBounds1}
            fillColor={fillColor}
            strokeColor="rgba(0, 0, 0, 0)"
        />
        <Polygon
            key={`${id}-mask-2`}
            geodesic={true}
            coordinates={worldOuterBounds2}
            fillColor={fillColor}
            strokeColor="rgba(0, 0, 0, 0)"
        />
        <Polygon
            key={`${id}-mask-3`}
            geodesic={true}
            coordinates={worldOuterBounds3}
            fillColor={fillColor}
            strokeColor="rgba(0, 0, 0, 0)"
        />
    </Fragment>;
};

export const InvertedCircle = ({id, center, radius, fillColor}) => {
    return <InvertedPolygon id={id} coordinates={circleToPolygon({center: center, radius: radius})} fillColor={fillColor} />;
};

export const DashedCircle = ({id, center, radius, fillColor, strokeColor, strokeWidth, lineDashPattern}) => {
    return (
        <Polygon
            key={id}
            coordinates={circleToPolygon({center: center, radius: radius})}
            fillColor={fillColor}
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
            lineDashPattern={lineDashPattern}
        />
    );
};
