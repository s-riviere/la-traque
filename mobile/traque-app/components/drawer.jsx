// React
import { useState, useEffect, Fragment } from 'react';
import { ScrollView, View, Text, Image, StyleSheet, TouchableOpacity, TouchableHighlight, Alert } from 'react-native';
import Collapsible from 'react-native-collapsible';
import LinearGradient from 'react-native-linear-gradient';
// Components
import { CustomImage } from './image';
import { CustomTextInput } from './input';
import { Stat } from './stat';
// Contexts
import { useTeamContext } from '../context/teamContext';
import { useSocket } from '../context/socketContext';
// Hooks
import { useTimeDifference } from '../hook/useTimeDifference';
import { useGame } from '../hook/useGame';
// Util
import { GameState } from '../util/gameState';
import { Colors } from '../util/colors';
import { secondsToHHMMSS } from '../util/format';

export const Drawer = ({ height }) => {
    const [collapsibleState, setCollapsibleState] = useState(true);
    const [enemyCaptureCode, setEnemyCaptureCode] = useState("");
    const {SERVER_URL} = useSocket();
    const {gameState, startDate} = useTeamContext();
    const {capture, enemyName, captureCode, name, teamId, distance, finishDate, nCaptures, nSentLocation, hasHandicap} = useGame();
    const [timeSinceStart] = useTimeDifference(startDate, 1000);
    const [avgSpeed, setAvgSpeed] = useState(0); // Speed in m/s
    const [enemyImageURI, setEnemyImageURI] = useState("../assets/images/missing_image.jpg");
    const [captureStatus, setCaptureStatus] = useState(0); // 0 : no capture | 1 : waiting for response from server | 2 : capture failed | 3 : capture succesful
    const captureStatusColor = {0: "#777", 1: "#FFA500", 2: "#FF6B6B", 3: "#81C784"};
    
    // Capture state update
    useEffect(() => {
        if (captureStatus == 2 || captureStatus == 3) {
            const timeout = setTimeout(() => {
                setCaptureStatus(0);
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [captureStatus]);
    
    // Refresh the image
    useEffect(() => {
        setEnemyImageURI(`${SERVER_URL}/photo/enemy?team=${teamId}&t=${new Date().getTime()}`);
    }, [SERVER_URL, enemyName, teamId]);

    // Update the average speed
    useEffect(() => {
        const hours = (finishDate ? (finishDate - startDate) : timeSinceStart*1000) / 1000 / 3600;
        const km = distance / 1000;
        setAvgSpeed(Math.floor(km / hours * 10) / 10);
    }, [distance, finishDate, startDate, timeSinceStart]);

    if (gameState != GameState.PLAYING) return;
    
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

    return (
        <View style={styles.outerDrawerContainer}>
            <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)']} style={{height: 70, width: "100%", position: "absolute", top: -30}}/>
            <View style={styles.innerDrawerContainer}>
                <TouchableHighlight onPress={() => setCollapsibleState(!collapsibleState)} style={styles.collapsibleButton} underlayColor="#d9d9d9">
                    <Image source={require('../assets/images/arrow.png')} style={{width: 20, height: 20, transform: [{ scaleY: collapsibleState ? 1 : -1 }] }} resizeMode="contain"></Image>
                </TouchableHighlight>
                <Collapsible style={[styles.collapsibleWindow, {height: height - 44}]} title="Collapse" collapsed={collapsibleState}>
                    <ScrollView contentContainerStyle={styles.collapsibleContent}>
                        { gameState == GameState.PLAYING && 
                            <Text style={{fontSize: 22, fontWeight: "bold", textAlign: "center"}}>Code de {(name ?? "Indisponible")} : {String(captureCode).padStart(4,"0")}</Text>
                        }
                        { gameState == GameState.PLAYING && !hasHandicap && <Fragment>
                            <View style={styles.imageContainer}>
                                {<Text style={{fontSize: 15, margin: 5}}>{"Cible (" + (enemyName ?? "Indisponible") + ")"}</Text>}
                                {<CustomImage source={{ uri : enemyImageURI }} canZoom/>}
                            </View>
                            <View style={styles.actionsContainer}>
                                <View style={styles.actionsLeftContainer}>
                                    <CustomTextInput style={{borderColor: captureStatusColor[captureStatus]}} value={enemyCaptureCode} inputMode="numeric" placeholder="Code cible"  onChangeText={setEnemyCaptureCode}/>
                                </View>
                                <View style={styles.actionsRightContainer}>
                                    <TouchableOpacity style={styles.button} onPress={handleCapture}>
                                        <Image source={require("../assets/images/target/white.png")} style={{width: 40, height: 40}} resizeMode="contain"/>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Fragment>}
                        <View style={{gap: 15, width: "100%", marginVertical: 15}}>
                            <View style={{flexDirection: "row", justifyContent: "space-around"}}>
                                <Stat source={require('../assets/images/distance.png')} description={"Distance parcourue"}>{Math.floor(distance / 100) / 10}km</Stat>
                                <Stat source={require('../assets/images/time.png')} description={"Temps écoulé au format HH:MM:SS"}>{secondsToHHMMSS((finishDate ? Math.floor((finishDate - startDate) / 1000) : timeSinceStart))}</Stat>
                                <Stat source={require('../assets/images/running.png')} description={"Vitesse moyenne"}>{avgSpeed}km/h</Stat>
                            </View>
                            <View style={{flexDirection: "row", justifyContent: "space-around"}}>
                                <Stat source={require('../assets/images/target/black.png')} description={"Nombre total de captures par votre équipe"}>{nCaptures}</Stat>
                                <Stat source={require('../assets/images/update_position.png')} description={"Nombre total d'envois de votre position"}>{nSentLocation}</Stat>
                            </View>
                        </View>
                    </ScrollView>
                </Collapsible>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    outerDrawerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    innerDrawerContainer: {
        width: "100%",
        backgroundColor: Colors.background,
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
        backgroundColor: Colors.background,
    },
    collapsibleContent: {
        paddingHorizontal: 15,
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
