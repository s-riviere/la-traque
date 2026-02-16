// React
import { useState, useEffect, useMemo, Fragment } from 'react';
import { View, Text, Image, Alert, StyleSheet, TouchableOpacity } from 'react-native';
// Expo
import { useRouter } from 'expo-router';
// Components
import { CustomMap } from '../components/map';
import { Drawer } from '../components/drawer';
// Contexts
import { useTeamConnexion } from '../context/teamConnexionContext';
import { useTeamContext } from '../context/teamContext';
// Hooks
import { useGame } from '../hook/useGame';
import { useTimeDifference } from '../hook/useTimeDifference';
// Util
import { GameState } from '../util/gameState';
import { TimerMMSS } from '../components/timer';
import { secondsToMMSS } from '../util/functions';
import { Colors } from '../util/colors';

const Interface = () => {
    const router = useRouter();
    const {messages, nextZoneDate, isShrinking, startLocationTracking, stopLocationTracking, gameState} = useTeamContext();
    const {loggedIn, logout, loading} = useTeamConnexion();
    const {name, ready, captured, locationSendDeadline, sendCurrentPosition, outOfZone, outOfZoneDeadline, hasHandicap, enemyHasHandicap} = useGame();
    const [timeLeftSendLocation] = useTimeDifference(locationSendDeadline, 1000);
    const [timeLeftNextZone] = useTimeDifference(nextZoneDate, 1000);
    const [timeLeftOutOfZone] = useTimeDifference(outOfZoneDeadline, 1000);
    const [bottomContainerHeight, setBottomContainerHeight] = useState(0);
    
    const statusMessage = useMemo(() => {
        switch (gameState) {
            case GameState.SETUP:
                return messages?.waiting || "Préparation de la partie";
            case GameState.PLACEMENT:
                return "Phase de placement";
            case GameState.PLAYING:
                if (captured) return messages?.captured || "Vous avez été éliminé...";
                if (!outOfZone) return "La partie est en cours";
                if (!hasHandicap) return `Veuillez retourner dans la zone\nHandicap dans ${secondsToMMSS(-timeLeftOutOfZone)}`;
                else return `Veuillez retourner dans la zone\nVotre position est révélée en continue`;
            case GameState.FINISHED:
                return `Vous avez ${captured ? (messages?.loser || "perdu...") : (messages?.winner || "gagné !")}`;
            default:
                return "Inconnue";
        }
    }, [gameState, messages, outOfZone, hasHandicap, timeLeftOutOfZone, captured]);

    // Router
    useEffect(() => {
        if (!loading) {
            if (!loggedIn) {
                router.replace("/");
            }
        }
    }, [router, loggedIn, loading]);

    // Activating geolocation tracking
    useEffect(() => {
        if (loggedIn) {
            startLocationTracking();
        } else {
            stopLocationTracking();
        }
    }, [startLocationTracking, stopLocationTracking, loggedIn]);

    return (
        <View style={styles.globalContainer}>
            <View style={styles.topContainer}>
                <View style={styles.topheadContainer}>
                    <TouchableOpacity style={{width: 40, height: 40}} onPress={logout}>
                        <Image source={require('../assets/images/logout.png')} style={{width: 40, height: 40}} resizeMode="contain"></Image>
                    </TouchableOpacity>
                    <TouchableOpacity style={{width: 40, height: 40}} onPress={() => Alert.alert("Settings")}>
                        <Image source={require('../assets/images/cogwheel.png')} style={{width: 40, height: 40}} resizeMode="contain"></Image>
                    </TouchableOpacity>
                </View>          
                <View style={styles.teamNameContainer}>
                    <Text style={{fontSize: 36, fontWeight: "bold", textAlign: "center"}}>{(name ?? "Indisponible")}</Text>
                </View>
                <View style={styles.logContainer}>
                    <TouchableOpacity style={styles.gameState}>
                        <Text style={{fontSize: 18}}>{statusMessage}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.infoContainer}>
                    { gameState == GameState.PLACEMENT &&
                        <View style={[styles.readyIndicator, {backgroundColor: ready ? "#3C3" : "#C33"}]}>
                            <Text style={{color: '#fff', fontSize: 16}}>{ready ? "Placé" : "Non placé"}</Text>
                        </View>
                    }
                    { gameState == GameState.PLAYING && !captured && <Fragment>
                        <TimerMMSS style={{width: "50%"}} title={isShrinking ? "Réduction de la zone" : "Durée de la zone"} seconds={-timeLeftNextZone} />
                        <TimerMMSS style={{width: "50%"}} title={"Position envoyée dans"} seconds={!hasHandicap ? -timeLeftSendLocation: 0} />
                    </Fragment>}
                </View>
                { enemyHasHandicap &&
                    <Text style={{fontSize: 18, marginTop: 6, fontWeight: "bold"}}>Position ennemie révélée en continue !</Text>
                }
            </View>
            <View style={styles.bottomContainer} onLayout={(event) => setBottomContainerHeight(event.nativeEvent.layout.height)}>
                <CustomMap/>
                { gameState == GameState.PLAYING && !captured && !hasHandicap &&
                    <TouchableOpacity style={styles.updatePosition} onPress={sendCurrentPosition}>
                        <Image source={require("../assets/images/update_position.png")} style={{width: 40, height: 40}} resizeMode="contain"></Image>
                    </TouchableOpacity>
                }
                { gameState == GameState.PLAYING && !captured &&
                    <Drawer height={bottomContainerHeight}/>
                }
            </View>
        </View>
    );
};

export default Interface;

const styles = StyleSheet.create({
    globalContainer: {
        backgroundColor: Colors.background,
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
        padding: 10,
    },
    infoContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginTop: 15
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
    updatePosition: {
        position: 'absolute',
        right: 30,
        bottom: 80,
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
