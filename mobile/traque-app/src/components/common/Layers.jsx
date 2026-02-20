// React
import { Fragment } from 'react';
import { Image } from 'react-native';
import { Marker, Polygon } from 'react-native-maps';
// Util
import { circleToPolygon } from '@/utils/functions';

const MARKER_IMAGES = {
    blue: require('@/assets/images/marker/blue.png'),
    red: require('@/assets/images/marker/red.png'),
    grey: require('@/assets/images/marker/grey.png'),
};

export const PositionMarker = ({ position, color = "blue", onPress = () => {} }) => {
    if (!position) return null;

    return (
        <Marker coordinate={{latitude: position[0], longitude: position[1]}} anchor={{ x: 0.33, y: 0.33 }} onPress={onPress}>
            <Image source={MARKER_IMAGES[color]} style={{width: 24, height: 24}} resizeMode="contain"/>
        </Marker>
    );
};

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

export const DashedCircle = ({id, center, radius, fillColor = "rgba(0, 0, 0, 0)", strokeColor, strokeWidth, lineDashPattern}) => {
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
