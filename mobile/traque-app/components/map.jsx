// React
import { useState, useEffect, useRef, Fragment } from 'react';
import { View, Image, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, Circle, Polygon } from 'react-native-maps';
import LinearGradient from 'react-native-linear-gradient';
// Contexts
import { useTeamContext } from '../context/teamContext';
// Hooks
import { useGame } from '../hook/useGame';
// Util
import { GameState } from '../util/gameState';
import { ZoneTypes, InitialRegions } from '../util/constants';

export const CustomMap = () => {
    const {zoneType, zoneExtremities, location, gameState} = useTeamContext();
    const {sendCurrentPosition, enemyLocation, startingArea, captured, lastSentLocation, hasHandicap} = useGame();
    const mapRef = useRef(null);
    const [centerMap, setCenterMap] = useState(true);

    // Center the map on user position
    useEffect(() => {
        if (centerMap && mapRef.current && location) {
            mapRef.current.animateToRegion({latitude: location[0], longitude: location[1], latitudeDelta: 0, longitudeDelta: 0.02}, 1000);
        }
    }, [centerMap, mapRef, location]);
    
    const latToLatitude = (pos) => ({latitude: pos.lat, longitude: pos.lng});

    return (
        <View style={styles.mapContainer}>
            <MapView ref={mapRef} style={{flex: 1}} initialRegion={InitialRegions.paris} mapType="standard" onTouchMove={() => setCenterMap(false)} toolbarEnabled={false}>
                { gameState == GameState.PLACEMENT && startingArea &&
                    <Circle center={{ latitude: startingArea.center.lat, longitude: startingArea.center.lng }} radius={startingArea.radius} strokeWidth={2} strokeColor={`rgba(0, 0, 255, 1)`} fillColor={`rgba(0, 0, 255, 0.2)`}/>
                }
                { gameState == GameState.PLAYING && zoneExtremities && 
                    <Fragment>
                        { zoneType == ZoneTypes.circle && zoneExtremities.begin && <Circle center={latToLatitude(zoneExtremities.begin.center)} radius={zoneExtremities.begin.radius} strokeColor="red" fillColor="rgba(255,0,0,0.1)" strokeWidth={2} />}
                        { zoneType == ZoneTypes.circle && zoneExtremities.end && <Circle center={latToLatitude(zoneExtremities.end.center)} radius={zoneExtremities.end.radius} strokeColor="green" fillColor="rgba(0,255,0,0.1)" strokeWidth={2} />}
                        { zoneType == ZoneTypes.polygon && zoneExtremities.begin && <Polygon coordinates={zoneExtremities.begin.polygon.map(pos => latToLatitude(pos))} strokeColor="red" fillColor="rgba(255,0,0,0.1)" strokeWidth={2} /> }
                        { zoneType == ZoneTypes.polygon && zoneExtremities.end && <Polygon coordinates={zoneExtremities.end.polygon.map(pos => latToLatitude(pos))} strokeColor="green" fillColor="rgba(0,255,0,0.1)" strokeWidth={2} /> }
                    </Fragment>
                }
                { location &&
                    <Marker coordinate={{ latitude: location[0], longitude: location[1] }} anchor={{ x: 0.33, y: 0.33 }} onPress={() => Alert.alert("Position actuelle", "Ceci est votre position")}>
                        <Image source={require("../assets/images/marker/blue.png")} style={{width: 24, height: 24}} resizeMode="contain"/>
                    </Marker>
                }
                { gameState == GameState.PLAYING && lastSentLocation && !hasHandicap &&
                    <Marker coordinate={{ latitude: lastSentLocation[0], longitude: lastSentLocation[1] }} anchor={{ x: 0.33, y: 0.33 }} onPress={() => Alert.alert("Position envoyée", "Ceci est votre dernière position connue par le serveur")}>
                        <Image source={require("../assets/images/marker/grey.png")} style={{width: 24, height: 24}} resizeMode="contain"/>
                    </Marker>
                }
                { gameState == GameState.PLAYING && enemyLocation && !hasHandicap &&
                    <Marker coordinate={{ latitude: enemyLocation[0], longitude: enemyLocation[1] }} anchor={{ x: 0.33, y: 0.33 }}>
                        <Image source={require("../assets/images/marker/red.png")} style={{width: 24, height: 24}} resizeMode="contain" onPress={() => Alert.alert("Position ennemie", "Ceci est la dernière position de vos ennemis connue")}/>
                    </Marker>
                }
            </MapView>
            <LinearGradient colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0)']} style={{height: 40, width: "100%", position: "absolute"}}/>
            { !centerMap && 
                <TouchableOpacity style={styles.centerMapContainer} onPress={() => setCenterMap(true)}>
                    <Image source={require("../assets/images/centerMap.png")} style={{width: 30, height: 30}} resizeMode="contain"></Image>
                </TouchableOpacity>
            }
            { gameState == GameState.PLAYING && !captured &&
                <View style={styles.toolBarRight}>
                    { !hasHandicap &&
                        <TouchableOpacity style={styles.updatePositionContainer} onPress={sendCurrentPosition}>
                            <Image source={require("../assets/images/update_position.png")} style={{width: 40, height: 40}} resizeMode="contain"></Image>
                        </TouchableOpacity>
                    }
                </View>
            }
        </View>
    );
};

const styles = StyleSheet.create({
    mapContainer: {
        flex: 1,
        width: '100%',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden',
    },
    centerMapContainer: {
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
    toolBarRight: {
        position: 'absolute',
        right: 30,
        bottom: 80
    },
    updatePositionContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'white',
        borderWidth: 4,
        borderColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
