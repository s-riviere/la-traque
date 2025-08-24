// React
import { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, Image, Alert, StyleSheet, TouchableOpacity, TouchableHighlight } from 'react-native';
import MapView, { Marker, Circle, Polygon } from 'react-native-maps';
// Expo
import { useRouter } from 'expo-router';
// Components
import CustomImage from '../components/image';
import CustomTextInput from '../components/input';
import Stat from '../components/stat';
import Collapsible from 'react-native-collapsible';
import LinearGradient from 'react-native-linear-gradient';
// Other
import { useSocket } from '../context/socketContext';
import { useTeamContext } from '../context/teamContext';
import { useTeamConnexion } from '../context/teamConnexionContext';
import { useDeadline, useTimeDifference } from '../hook/useTimeDifference';
import { GameState } from '../util/gameState';
import useGame from '../hook/useGame';

const backgroundColor = '#f5f5f5';
const initialRegion = {latitude: 48.864, longitude: 2.342, latitudeDelta: 0, longitudeDelta: 50} // France centrée sur Paris

export default function Display() {
    const arrowUp = require('../assets/images/arrow.png');
    const [collapsibleState, setCollapsibleState] = useState(true);
    const [bottomContainerHeight, setBottomContainerHeight] = useState(0);
    const router = useRouter();
    const {SERVER_URL} = useSocket();
    const {gameSettings, zoneExtremities, nextZoneDate, isShrinking, location, startLocationTracking, stopLocationTracking, gameState, zone} = useTeamContext();
    const {loggedIn, logout, loading} = useTeamConnexion();
    const {sendCurrentPosition, capture, enemyLocation, enemyName, startingArea, captureCode, name, ready, captured, lastSentLocation, locationSendDeadline, penalties, teamId, outOfZone, outOfZoneDeadline, distance, startDate, finishDate, nCaptures, nSentLocation} = useGame();
    const [enemyCaptureCode, setEnemyCaptureCode] = useState("");
    const [timeLeftSendLocation] = useTimeDifference(locationSendDeadline, 1000);
    const [timeLeftNextZone] = useTimeDifference(nextZoneDate, 1000);
    const [timeLeftOutOfZone] = useTimeDifference(outOfZoneDeadline, 1000);
    const [timeSinceStart] = useTimeDifference(startDate, 1000);
    const [avgSpeed, setAvgSpeed] = useState(0); // Speed in m/s
    const [enemyImageURI, setEnemyImageURI] = useState("../assets/images/missing_image.jpg");
    const [captureStatus, setCaptureStatus] = useState(0); // 0 : no capture | 1 : waiting for response from server | 2 : capture failed | 3 : capture succesful
    const captureStatusColor = {0: "#777", 1: "#FFA500", 2: "#FF6B6B", 3: "#81C784"};
    const mapRef = useRef(null);
    const [centerMap, setCenterMap] = useState(true);

    // Router
    useEffect(() => {
        if (!loading) {
            if (!loggedIn) {
                router.replace("/");
            }
        }
    }, [loggedIn, loading]);

    // Activating geolocation tracking
    useEffect(() => {
        if (loggedIn && (gameState == GameState.SETUP || gameState == GameState.PLAYING || gameState == GameState.PLACEMENT) && !captured) {
            startLocationTracking();
        } else {
            stopLocationTracking();
        }
    }, [loggedIn, gameState, captured]);

    // Refresh the image
    useEffect(() => {
        setEnemyImageURI(`${SERVER_URL}/photo/enemy?team=${teamId}&t=${new Date().getTime()}`);
    }, [enemyName, teamId]);

    // Capture state update
    useEffect(() => {
        if (captureStatus == 2 || captureStatus == 3) {
            const timeout = setTimeout(() => {
                setCaptureStatus(0);
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [captureStatus]);

    // Center the map on user position
    useEffect(() => {
        if (centerMap && mapRef.current && location) {
            mapRef.current.animateToRegion({latitude: location[0], longitude: location[1], latitudeDelta: 0, longitudeDelta: 0.02}, 1000);
        }
    }, [centerMap, mapRef, location]);

    // Update the average speed
    useEffect(() => {
        const time = finishDate ? (finishDate - startDate) : timeSinceStart;
        setAvgSpeed(distance/time);
    }, [distance, finishDate, timeSinceStart]);

    function toggleCollapsible() {
        setCollapsibleState(!collapsibleState);
    };

    function handleCapture() {
        if (captureStatus != 1) {
            setCaptureStatus(1);
            capture(enemyCaptureCode)
                .then((response) => {
                    if (response.hasCaptured) {
                        setCaptureStatus(3);
                    } else {
                        setCaptureStatus(2);
                    }
                })
                .catch(() => {
                    Alert.alert("Échec", "La connexion au serveur a échoué.");
                    setCaptureStatus(2);
                });
            setEnemyCaptureCode("");
        }
    }

    function formatTimeMinutes(time) {
        // time is in seconds
        if (!Number.isInteger(time)) return "Inconnue";
        if (time < 0) time = 0;
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return String(minutes).padStart(2,"0") + ":" + String(seconds).padStart(2,"0");
    }

    function formatTimeHours(time) {
        // time is in seconds
        if (!Number.isInteger(time)) return "Inconnue";
        if (time < 0) time = 0;
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return String(hours).padStart(2,"0") + ":" + String(minutes).padStart(2,"0") + ":" + String(seconds).padStart(2,"0");
    }

    function circle(color, circle) {
        return (
            <Circle
                center={{ latitude: circle.center.lat, longitude: circle.center.lng }}
                radius={circle.radius}
                strokeWidth={2}
                strokeColor={`rgba(${color}, 1)`}
                fillColor={`rgba(${color}, 0.2)`}
            />
        );
    }

    const Logout = () => {
        return (
            <TouchableOpacity style={{width: 40, height: 40}} onPress={logout}>
                <Image source={require('../assets/images/logout.png')} style={{width: 40, height: 40}} resizeMode="contain"></Image>
            </TouchableOpacity>
        );
    }

    const Settings = () => {
        return (
            <TouchableOpacity style={{width: 40, height: 40}} onPress={() => Alert.alert("Settings")}>
                <Image source={require('../assets/images/cogwheel.png')} style={{width: 40, height: 40}} resizeMode="contain"></Image>
            </TouchableOpacity>
        );
    }

    const TeamName = () => {
        return(
            <Text style={{fontSize: 36, fontWeight: "bold", textAlign: "center"}}>{(name ?? "Indisponible")}</Text>
        );
    }

    const GameLog = () => {
        return (
            <TouchableOpacity style={{width:"100%"}}>
                { gameState == GameState.SETUP && <Text style={styles.gameState}>Préparation de la partie</Text>}
                { gameState == GameState.PLACEMENT && <Text style={styles.gameState}>Phase de placement</Text>}
                { gameState == GameState.PLAYING && !outOfZone && <Text style={styles.gameState}>La partie est en cours</Text>}
                { gameState == GameState.PLAYING && outOfZone && <Text style={styles.gameStateOutOfZone}>Hors zone (pénalité dans {formatTimeMinutes(-timeLeftOutOfZone)})</Text>}
                { gameState == GameState.FINISHED && <Text style={styles.gameState}>La partie est terminée</Text>}
            </TouchableOpacity>
        );
    }

    const TimeBeforeNextZone = () => {
        return (
            <View style={{width: "100%", alignItems: "center", justifyContent: "center"}}>
                <Text style={{fontSize: 15}}>{isShrinking ? "Réduction de la zone" : "Durée de la zone"}</Text>
                <Text style={{fontSize: 30, fontWeight: "bold"}}>{formatTimeMinutes(-timeLeftNextZone)}</Text> 
            </View>
        );
    }

    const TimeBeforeNextPosition = () => {
        return (
            <View style={{width: "100%", alignItems: "center", justifyContent: "center"}}>
                <Text style={{fontSize: 15}}>Position envoyée dans</Text>
                <Text style={{fontSize: 30, fontWeight: "bold"}}>{formatTimeMinutes(-timeLeftSendLocation)}</Text>
            </View>
        );
    }

    const Timers = () => {
        return (
            <View style={styles.timersContainer}>
                <View style={styles.zoneTimerContainer}>
                    { TimeBeforeNextZone() }
                </View>
                <View style={styles.positionTimerContainer}>
                    { TimeBeforeNextPosition() }
                </View>
            </View>
        );
    }

    const Ready = () => {
        return (
            <View style={styles.timersContainer}>
                <View style={[styles.readyIndicator, {backgroundColor: ready ? "#3C3" : "#C33"}]}>
                    <Text style={{color: '#fff', fontSize: 16}}>{ready ? "Placé" : "Non placé"}</Text>
                </View>
            </View>
        );
    }

    const CapturedMessage = () => {
        return (
            <View style={[styles.timersContainer, {height: 61}]}>
                <Text style={{fontSize: 20}}>{gameSettings?.capturedMessage || "Vous avez été éliminé..."}</Text>
            </View>    
        );
    }

    const EndGameMessage = () => { 
        return (
            <View style={[styles.timersContainer, {height: 61}]}>
                {captured && <Text style={{fontSize: 20}}>{gameSettings?.loserEndGameMessage || "Vous avez perdu..."}</Text>}
                {!captured && <Text style={{fontSize: 20}}>{gameSettings?.winnerEndGameMessage || "Vous avez gagné !"}</Text>}
            </View>
        );
    }

    const Map = () => {
        return (
            <MapView ref={mapRef} style={{flex: 1}} initialRegion={initialRegion} mapType="standard" onTouchMove={() => setCenterMap(false)}>
                { gameState == GameState.PLACEMENT && startingArea && circle("0, 0, 255", startingArea)}
                { gameState == GameState.PLAYING && zoneExtremities && <Polygon coordinates={zoneExtremities.begin.points} strokeColor="red" fillColor="rgba(255,0,0,0.1)" strokeWidth={2} /> }
                { gameState == GameState.PLAYING && zoneExtremities && <Polygon coordinates={zoneExtremities.end.points} strokeColor="green" fillColor="rgba(0,255,0,0.1)" strokeWidth={2} /> }
                { location &&
                    <Marker coordinate={{ latitude: location[0], longitude: location[1] }} anchor={{ x: 0.33, y: 0.33 }}>
                        <Image source={require("../assets/images/marker/blue.png")} style={{width: 24, height: 24}} resizeMode="contain"/>
                    </Marker>
                }
                { gameState == GameState.PLAYING && lastSentLocation &&
                    <Marker coordinate={{ latitude: lastSentLocation[0], longitude: lastSentLocation[1] }} anchor={{ x: 0.33, y: 0.33 }}>
                        <Image source={require("../assets/images/marker/grey.png")} style={{width: 24, height: 24}} resizeMode="contain"/>
                    </Marker>
                }
                { gameState == GameState.PLAYING && enemyLocation &&
                    <Marker coordinate={{ latitude: enemyLocation[0], longitude: enemyLocation[1] }} anchor={{ x: 0.33, y: 0.33 }}>
                        <Image source={require("../assets/images/marker/red.png")} style={{width: 24, height: 24}} resizeMode="contain"/>
                    </Marker>
                }
            </MapView>
        );
    }

    const UpdatePositionButton = () => {
        return (
            <TouchableOpacity style={styles.updatePositionContainer} onPress={sendCurrentPosition}>
                <Image source={require("../assets/images/update_position.png")} style={{width: 40, height: 40}} resizeMode="contain"></Image>
            </TouchableOpacity>
        );
    }

    const CenterMapButton = () => {
        return (
            <TouchableOpacity style={styles.centerMapContainer} onPress={() => setCenterMap(true)}>
                <Image source={require("../assets/images/centerMap.png")} style={{width: 30, height: 30}} resizeMode="contain"></Image>
            </TouchableOpacity>
        );
    }

    const LayerButton = () => {
        return(
            <TouchableOpacity style={styles.layerContainer} onPress={() => Alert.alert("Layer")}>
                <Image source={require('../assets/images/path.png')} style={{width: 40, height: 40}} resizeMode="contain"></Image>
            </TouchableOpacity>
        );
    }

    const CollapsibleButton = () => {
        return (
            <TouchableHighlight onPress={toggleCollapsible} style={styles.collapsibleButton} underlayColor="#d9d9d9">
                <Image source={arrowUp} style={{width: 20, height: 20, transform: [{ scaleY: collapsibleState ? 1 : -1 }] }} resizeMode="contain"></Image>
            </TouchableHighlight>
        );
    }

    const TeamCaptureCode = () => {
        return (
            <Text style={{fontSize: 22, fontWeight: "bold", textAlign: "center"}}>Code de {(name ?? "Indisponible")} : {String(captureCode).padStart(4,"0")}</Text>
        );
    }

    const ChasedTeamImage = () => {
        return (
            <View style={styles.imageContainer}>
                <Text style={{fontSize: 15, margin: 5}}>{"Cible (" + (enemyName ?? "Indisponible") + ")"}</Text>
                <CustomImage source={{ uri : enemyImageURI }} canZoom/>
            </View>
        );
    }

    const CaptureCode = () => {
        return (
            <View style={styles.actionsLeftContainer}>
                <CustomTextInput style={{borderColor: captureStatusColor[captureStatus]}} value={enemyCaptureCode} inputMode="numeric" placeholder="Code cible"  onChangeText={setEnemyCaptureCode}/>
            </View>
        );
    }
    
    const CaptureButton = () => {
        return (
            <View style={styles.actionsRightContainer}>
                <TouchableOpacity style={styles.button} onPress={handleCapture}>
                    <Image source={require("../assets/images/target/white.png")} style={{width: 40, height: 40}} resizeMode="contain"/>
                </TouchableOpacity>
            </View>
        );
    }

    const Stats = () => {
        return (
            <View style={{gap: 15, width: "100%", marginVertical: 15}}>
                <View style={{flexDirection: "row", justifyContent: "space-around"}}>
                    <Stat source={require('../assets/images/distance.png')} description={"Distance parcourue"}>{(distance / 1000).toFixed(1)}km</Stat>
                    <Stat source={require('../assets/images/time.png')} description={"Temps écoulé au format HH:MM:SS"}>{formatTimeHours((finishDate ? Math.floor((finishDate - startDate) / 1000) : timeSinceStart))}</Stat>
                    <Stat source={require('../assets/images/running.png')} description={"Vitesse moyenne"}>{(avgSpeed*3.6).toFixed(1)}km/h</Stat>
                </View>
                <View style={{flexDirection: "row", justifyContent: "space-around"}}>
                    <Stat source={require('../assets/images/target/black.png')} description={"Nombre total de captures par votre équipe"}>{nCaptures}</Stat>
                    <Stat source={require('../assets/images/update_position.png')} description={"Nombre total d'envois de votre position"}>{nSentLocation}</Stat>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.globalContainer}>
            <View style={styles.topContainer}>
                <View style={styles.topheadContainer}>
                    { Logout() }
                    { penalties > 0 && gameState == GameState.PLAYING &&
                        <Text style={{marginTop: 15, fontSize: 15}}>Pénalités : {penalties}</Text>
                    }
                    { false && Settings() }
                </View>          
                <View style={styles.teamNameContainer}>
                    { TeamName() }
                </View>
                <View style={styles.logContainer}>
                    { GameLog() }
                </View>
                { gameState == GameState.PLACEMENT &&
                    Ready()
                }
                { gameState == GameState.PLAYING && !captured &&
                    Timers()
                }
                { gameState == GameState.PLAYING && captured &&
                    CapturedMessage()
                }
                { gameState == GameState.FINISHED &&
                    EndGameMessage()
                }
            </View>
            <View style={styles.bottomContainer} onLayout={(event) => {setBottomContainerHeight(event.nativeEvent.layout.height)}}>
                <View style={styles.mapContainer}>
                    { Map() }
                    <LinearGradient colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0)']} style={{height: 40, width: "100%", position: "absolute"}}/>
                    { !centerMap && CenterMapButton() }
                    { false && gameState == GameState.PLAYING && !captured &&
                        <View style={styles.toolBarLeft}>
                            { LayerButton() }
                        </View>
                    }
                    { gameState == GameState.PLAYING && !captured &&
                        <View style={styles.toolBarRight}>
                            { UpdatePositionButton() }
                        </View>
                    }
                </View>
                { gameState == GameState.PLAYING && !captured &&
                    <View style={styles.outerDrawerContainer}>
                        <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)']} style={{height: 70, width: "100%", position: "absolute", top: -30}}/>
                        <View style={styles.innerDrawerContainer}>
                            { CollapsibleButton() }
                            <Collapsible style={[styles.collapsibleWindow, {height: bottomContainerHeight - 44}]} title="Collapse" collapsed={collapsibleState}>
                                <ScrollView contentContainerStyle={styles.collapsibleContent}>
                                    { TeamCaptureCode() }
                                    { ChasedTeamImage() }
                                    <View style={styles.actionsContainer}>
                                        { CaptureCode() }
                                        { CaptureButton() }
                                    </View>
                                    { Stats() }
                                </ScrollView>
                            </Collapsible>
                        </View>
                    </View>
                }
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    globalContainer: {
        backgroundColor: backgroundColor,
        flex: 1,
    },
    topContainer: {
        width: '100%',
        alignItems: 'center',
        padding: 15,
    },
    topheadContainer: {
        width: "100%",
        flexDirection: "row",
        justifyContent: 'space-between'
    },
    teamNameContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    logContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15
    },
    gameState: {
        borderWidth: 2,
        borderRadius: 10,
        width: "100%",
        backgroundColor: 'white',
        fontSize: 20,
        padding: 10,
    },
    gameStateOutOfZone: {
        borderWidth: 2,
        borderRadius: 10,
        width: "100%",
        backgroundColor: 'white',
        fontSize: 20,
        padding: 10,
        borderColor: 'red'
    },
    timersContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginTop: 15
    },
    zoneTimerContainer: {
        width: "50%",
        alignItems: 'center',
        justifyContent: 'center',
    },
    positionTimerContainer: {
        width: "50%",
        alignItems: 'center',
        justifyContent: 'center',
    },
    readyIndicator: {
        width: "100%",
        maxWidth: 240,
        height: 61,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
        borderRadius: 10
    },
    bottomContainer: {
        flex: 1,
        alignItems: 'center'
    },
    mapContainer: {
        flex: 1,
        width: '100%',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden',
    },
    outerDrawerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center'
    },
    innerDrawerContainer: {
        width: "100%",
        alignItems: 'center',
        backgroundColor: backgroundColor,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden',
    },
    collapsibleButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: "100%",
        height: 45
    },
    collapsibleWindow: {
        width: "100%",
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: backgroundColor,
    },
    collapsibleContent: {
        paddingHorizontal: 15,
        alignItems: 'center'
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
    toolBarLeft: {
        position: 'absolute',
        left: 30,
        bottom: 80
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
    layerContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'white',
        borderWidth: 4,
        borderColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageContainer: {
        width: "100%", 
        alignItems: "center", 
        justifyContent: "center", 
        marginTop: 15
    },
    actionsContainer: {
        flexDirection: "row",
        width: "100%",
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 15
    },
    actionsLeftContainer: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15
    },
    actionsRightContainer: {
        width: 100,
        alignItems: 'center',
        justifyContent: 'center'
    },
    button: {
        borderRadius: 12,
        width: '100%',
        height: 75,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#444'
    },
});
