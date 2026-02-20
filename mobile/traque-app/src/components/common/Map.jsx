// React
import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView from 'react-native-maps';
// Components
import { PositionMarker } from '@/components/common/Layers';
import { IconButton } from '@/components/common/IconButton';
import { Show } from '@/components/common/Show';
// Hook
import { useLocation } from '@/hooks/useLocation';
// Util
import { INITIAL_REGIONS } from '@/constants';

export const Map = ({ children }) => {
    const { location } = useLocation();
    const [centerMap, setCenterMap] = useState(true);
    const mapRef = useRef(null);

    // Center the map on user position
    useEffect(() => {
        if (centerMap && location && mapRef.current) {
            mapRef.current.animateToRegion({latitude: location[0], longitude: location[1], latitudeDelta: 0, longitudeDelta: 0.02}, 1000);
        }
    }, [centerMap, location]);

    return (
        <View style={styles.container}>
            <MapView ref={mapRef} style={styles.mapView} initialRegion={INITIAL_REGIONS.PARIS} mapType={"standard"} onTouchMove={() => setCenterMap(false)} toolbarEnabled={false}>
                {children}
                <PositionMarker position={location} />
            </MapView>
            <Show when={!centerMap}>
                <IconButton style={styles.centerMap} source={require("@/assets/images/centerMap.png")} onPress={() => setCenterMap(true)} />
            </Show>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mapView: {
        flex: 1,
    },
    centerMap: {
        position: 'absolute',
        right: 20,
        top: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: 'black'
    },
});
