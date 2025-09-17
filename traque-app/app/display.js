// React
import { useState, useEffect, useRef, Fragment } from 'react';
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
import { useTimeDifference } from '../hook/useTimeDifference';
import { GameState } from '../util/gameState';
import useGame from '../hook/useGame';

const backgroundColor = '#f5f5f5';
const initialRegion = {latitude: 48.864, longitude: 2.342, latitudeDelta: 0, longitudeDelta: 50} // France centrée sur Paris

const zoneTypes = {
    circle: "circle",
    polygon: "polygon"
}

export default function Display() {
    const arrowUp = require('../assets/images/arrow.png');
    const [collapsibleState, setCollapsibleState] = useState(true);
    const [bottomContainerHeight, setBottomContainerHeight] = useState(0);
    const router = useRouter();
    const {SERVER_URL} = useSocket();
    const {messages, zoneType, zoneExtremities, nextZoneDate, isShrinking, location, startLocationTracking, stopLocationTracking, gameState, startDate} = useTeamContext();
    const {loggedIn, logout, loading} = useTeamConnexion();
    const {sendCurrentPosition, capture, enemyLocation, enemyName, startingArea, captureCode, name, ready, captured, lastSentLocation, locationSendDeadline, teamId, outOfZone, outOfZoneDeadline, distance, finishDate, nCaptures, nSentLocation, hasHandicap, enemyHasHandicap} = useGame();
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
        if (loggedIn) {
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
        const hours = (finishDate ? (finishDate - startDate) : timeSinceStart*1000) / 1000 / 3600;
        const km = distance / 1000;
        setAvgSpeed(Math.floor(km / hours * 10) / 10);
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
                { gameState == GameState.SETUP && <Text style={styles.gameState}>{messages?.waiting || "Préparation de la partie"}</Text>}
                { gameState == GameState.PLACEMENT && <Text style={styles.gameState}>Phase de placement</Text>}
                { gameState == GameState.PLAYING && !outOfZone && <Text style={styles.gameState}>La partie est en cours</Text>}
                { gameState == GameState.PLAYING && outOfZone && !hasHandicap && <Text style={styles.gameStateOutOfZone}>{`Veuillez retourner dans la zone\nHandicap dans ${formatTimeMinutes(-timeLeftOutOfZone)}`}</Text>}
                { gameState == GameState.PLAYING && hasHandicap && <Text style={styles.gameStateOutOfZone}>{`Veuillez retourner dans la zone\nVotre position est révélée en continue`}</Text>}
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
                <Text style={{fontSize: 30, fontWeight: "bold"}}>{ !hasHandicap ? formatTimeMinutes(-timeLeftSendLocation) : "00:00"}</Text>
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
                <Text style={{fontSize: 20}}>{messages?.captured || "Vous avez été éliminé..."}</Text>
            </View>    
        );
    }

    const EndGameMessage = () => { 
        return (
            <View style={[styles.timersContainer, {height: 61}]}>
                {captured && <Text style={{fontSize: 20}}>{messages?.loser || "Vous avez perdu..."}</Text>}
                {!captured && <Text style={{fontSize: 20}}>{messages?.winner || "Vous avez gagné !"}</Text>}
            </View>
        );
    }

    const Zones = () => {
        const latToLatitude = (pos) => ({latitude: pos.lat, longitude: pos.lng});

        return (
            <Fragment>
                { zoneType == zoneTypes.circle && zoneExtremities.begin && <Circle center={latToLatitude(zoneExtremities.begin.center)} radius={zoneExtremities.begin.radius} strokeColor="red" fillColor="rgba(255,0,0,0.1)" strokeWidth={2} />}
                { zoneType == zoneTypes.circle && zoneExtremities.end && <Circle center={latToLatitude(zoneExtremities.end.center)} radius={zoneExtremities.end.radius} strokeColor="green" fillColor="rgba(0,255,0,0.1)" strokeWidth={2} />}
                { zoneType == zoneTypes.polygon && zoneExtremities.begin && <Polygon coordinates={zoneExtremities.begin.polygon.map(pos => latToLatitude(pos))} strokeColor="red" fillColor="rgba(255,0,0,0.1)" strokeWidth={2} /> }
                { zoneType == zoneTypes.polygon && zoneExtremities.end && <Polygon coordinates={zoneExtremities.end.polygon.map(pos => latToLatitude(pos))} strokeColor="green" fillColor="rgba(0,255,0,0.1)" strokeWidth={2} /> }
            </Fragment>
        );
    }

    const Map = () => {
        return (
            <MapView ref={mapRef} style={{flex: 1}} initialRegion={initialRegion} mapType="standard" onTouchMove={() => setCenterMap(false)} toolbarEnabled={false}>
                { gameState == GameState.PLACEMENT && startingArea && circle("0, 0, 255", startingArea)}
                { gameState == GameState.PLAYING && zoneExtremities && <Zones/>}
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
        );
    }

    const UpdatePositionButton = () => {
        return ( !hasHandicap &&
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
                {<Text style={{fontSize: 15, margin: 5}}>{"Cible (" + (enemyName ?? "Indisponible") + ")"}</Text>}
                {<CustomImage source={{ uri : enemyImageURI }} canZoom/>}
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
                    <Stat source={require('../assets/images/distance.png')} description={"Distance parcourue"}>{Math.floor(distance / 100) / 10}km</Stat>
                    <Stat source={require('../assets/images/time.png')} description={"Temps écoulé au format HH:MM:SS"}>{formatTimeHours((finishDate ? Math.floor((finishDate - startDate) / 1000) : timeSinceStart))}</Stat>
                    <Stat source={require('../assets/images/running.png')} description={"Vitesse moyenne"}>{avgSpeed}km/h</Stat>
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
                {enemyHasHandicap && <Text style={{fontSize: 18, marginTop: 6, fontWeight: "bold"}}>Position ennemie révélée en continue !</Text>}
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
                { (gameState == GameState.PLAYING || gameState == GameState.FINISHED) &&
                    <View style={styles.outerDrawerContainer}>
                        <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)']} style={{height: 70, width: "100%", position: "absolute", top: -30}}/>
                        <View style={styles.innerDrawerContainer}>
                            { CollapsibleButton() }
                            <Collapsible style={[styles.collapsibleWindow, {height: bottomContainerHeight - 44}]} title="Collapse" collapsed={collapsibleState}>
                                <ScrollView contentContainerStyle={styles.collapsibleContent}>
                                    { gameState == GameState.PLAYING && TeamCaptureCode() }
                                    { gameState == GameState.PLAYING && !hasHandicap && <Fragment>
                                        { ChasedTeamImage() }
                                        <View style={styles.actionsContainer}>
                                            { CaptureCode() }
                                            { CaptureButton() }
                                        </View>
                                    </Fragment>}
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
        fontSize: 18,
        padding: 10,
    },
    gameStateOutOfZone: {
        borderWidth: 2,
        borderRadius: 10,
        width: "100%",
        backgroundColor: 'white',
        fontSize: 18,
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
    },
    innerDrawerContainer: {
        width: "100%",
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
        justifyContent: 'center',
        backgroundColor: backgroundColor,
    },
    collapsibleContent: {
        paddingHorizontal: 15,
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
