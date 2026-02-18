// React
import { useState, useEffect, useMemo, useRef } from 'react';
import { View, Image, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, Circle, Polygon } from 'react-native-maps';
import LinearGradient from 'react-native-linear-gradient';
// Components
import { DashedCircle, InvertedCircle, InvertedPolygon } from './layer';
// Contexts
import { useTeam } from '../contexts/teamContext';
// Hook
import { useLocation } from '../hooks/useLocation';
// Util
import { ZONE_TYPES, INITIAL_REGIONS, GAME_STATE } from '../constants';

export const CustomMap = () => {
    const { location } = useLocation();
    const {teamInfos, zoneType, zoneExtremities, gameState} = useTeam();
    const {enemyLocation, startingArea, lastSentLocation, hasHandicap} = teamInfos;
    const [centerMap, setCenterMap] = useState(true);
    const mapRef = useRef(null);

    // Center the map on user position
    useEffect(() => {
        if (centerMap && location && mapRef.current) {
            mapRef.current.animateToRegion({...location, latitudeDelta: 0, longitudeDelta: 0.02}, 1000);
        }
    }, [centerMap, location]);


    // Map layers

    const latToLatitude = (pos) => ({latitude: pos.lat, longitude: pos.lng});

    const startZone = useMemo(() => {
        if (gameState != GAME_STATE.PLACEMENT || !startingArea) return null;

        return (
            <Circle key="start-zone" center={{ latitude: startingArea.center.lat, longitude: startingArea.center.lng }} radius={startingArea.radius} strokeWidth={2} strokeColor={`rgba(0, 0, 255, 1)`} fillColor={`rgba(0, 0, 255, 0.2)`}/>
        );
    }, [gameState, startingArea]);

    const gameZone = useMemo(() => {
        if (gameState !== GAME_STATE.PLAYING || !zoneExtremities) return null;

        const items = [];
        
        const nextZoneStrokeColor = "rgb(90, 90, 90)";
        const zoneColor = "rgba(25, 83, 169, 0.4)";
        const strokeWidth = 3;
        const lineDashPattern = [30, 10];

        if (zoneType === ZONE_TYPES.CIRCLE) {
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
        } else if (zoneType === ZONE_TYPES.POLYGON) {
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
        }

        return items.length ? items : null;
    }, [gameState, zoneType, zoneExtremities]);

    const currentPositionMarker = useMemo(() => {
        if (!location) return null;

        return (
            <Marker key={"current-position-marker"} coordinate={location} anchor={{ x: 0.33, y: 0.33 }} onPress={() => Alert.alert("Position actuelle", "Ceci est votre position")}>
                <Image source={require("../assets/images/marker/blue.png")} style={styles.markerImage} resizeMode="contain"/>
            </Marker>
        );
    }, [location]);

    const lastPositionMarker = useMemo(() => {
        if (gameState != GAME_STATE.PLAYING || !lastSentLocation || hasHandicap) return null;

        return (
            <Marker key={"last-position-marker"} coordinate={{ latitude: lastSentLocation[0], longitude: lastSentLocation[1] }} anchor={{ x: 0.33, y: 0.33 }} onPress={() => Alert.alert("Position envoyée", "Ceci est votre dernière position connue par le serveur")}>
                <Image source={require("../assets/images/marker/grey.png")} style={styles.markerImage} resizeMode="contain"/>
            </Marker>
        );
    }, [gameState, hasHandicap, lastSentLocation]);

    const enemyPositionMarker = useMemo(() => {
        if (gameState != GAME_STATE.PLAYING || !enemyLocation || hasHandicap) return null;

        return (
            <Marker key={"enemy-position-marker"} coordinate={{ latitude: enemyLocation[0], longitude: enemyLocation[1] }} anchor={{ x: 0.33, y: 0.33 }} onPress={() => Alert.alert("Position ennemie", "Ceci est la dernière position de vos ennemis connue")}>
                <Image source={require("../assets/images/marker/red.png")} style={styles.markerImage} resizeMode="contain"/>
            </Marker>
        );
    }, [gameState, hasHandicap, enemyLocation]);


    return (
        <View style={styles.container}>
            <MapView ref={mapRef} style={{flex: 1}} initialRegion={INITIAL_REGIONS.PARIS} mapType="standard" onTouchMove={() => setCenterMap(false)} toolbarEnabled={false}>
                {startZone}
                {gameZone}
                {currentPositionMarker}
                {lastPositionMarker}
                {enemyPositionMarker}
            </MapView>
            <LinearGradient colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0)']} style={{height: 40, width: "100%", position: "absolute"}}/>
            { !centerMap && 
                <TouchableOpacity style={styles.centerMap} onPress={() => setCenterMap(true)}>
                    <Image source={require("../assets/images/centerMap.png")} style={{width: 30, height: 30}} resizeMode="contain"></Image>
                </TouchableOpacity>
            }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden',
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
        borderColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerImage: {
        width: 24,
        height: 24
    }
});
