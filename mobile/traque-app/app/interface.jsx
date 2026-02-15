// React
import { useState, useEffect, Fragment } from 'react';
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
import { secondsToMMSS } from '../util/format';
import { Colors } from '../util/colors';

const Interface = () => {
    const router = useRouter();
    const {messages, nextZoneDate, isShrinking, startLocationTracking, stopLocationTracking, gameState} = useTeamContext();
    const {loggedIn, logout, loading} = useTeamConnexion();
    const {name, ready, captured, locationSendDeadline, outOfZone, outOfZoneDeadline, hasHandicap, enemyHasHandicap} = useGame();
    const [timeLeftSendLocation] = useTimeDifference(locationSendDeadline, 1000);
    const [timeLeftNextZone] = useTimeDifference(nextZoneDate, 1000);
    const [timeLeftOutOfZone] = useTimeDifference(outOfZoneDeadline, 1000);
    const [bottomContainerHeight, setBottomContainerHeight] = useState(0);

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
                    <TouchableOpacity style={{width:"100%"}}>
                        { gameState == GameState.SETUP && <Text style={styles.gameState}>{messages?.waiting || "Préparation de la partie"}</Text>}
                        { gameState == GameState.PLACEMENT && <Text style={styles.gameState}>Phase de placement</Text>}
                        { gameState == GameState.PLAYING && !outOfZone && <Text style={styles.gameState}>La partie est en cours</Text>}
                        { gameState == GameState.PLAYING && outOfZone && !hasHandicap && <Text style={styles.gameStateOutOfZone}>{`Veuillez retourner dans la zone\nHandicap dans ${secondsToMMSS(-timeLeftOutOfZone)}`}</Text>}
                        { gameState == GameState.PLAYING && hasHandicap && <Text style={styles.gameStateOutOfZone}>{`Veuillez retourner dans la zone\nVotre position est révélée en continue`}</Text>}
                        { gameState == GameState.FINISHED && <Text style={styles.gameState}>La partie est terminée</Text>}
                    </TouchableOpacity>
                </View>
                { gameState == GameState.PLACEMENT &&
                    <View style={styles.timersContainer}>
                        <View style={[styles.readyIndicator, {backgroundColor: ready ? "#3C3" : "#C33"}]}>
                            <Text style={{color: '#fff', fontSize: 16}}>{ready ? "Placé" : "Non placé"}</Text>
                        </View>
                    </View>
                }
                { gameState == GameState.PLAYING && !captured && <Fragment>
                    <View style={styles.timersContainer}>
                        <TimerMMSS style={{width: "50%"}} title={isShrinking ? "Réduction de la zone" : "Durée de la zone"} seconds={-timeLeftNextZone} />
                        <TimerMMSS style={{width: "50%"}} title={"Position envoyée dans"} seconds={!hasHandicap ? -timeLeftSendLocation: 0} />
                    </View>
                    {enemyHasHandicap &&
                        <Text style={{fontSize: 18, marginTop: 6, fontWeight: "bold"}}>Position ennemie révélée en continue !</Text>
                    }
                </Fragment>}
                { gameState == GameState.PLAYING && captured &&
                    <View style={[styles.timersContainer, {height: 61}]}>
                        <Text style={{fontSize: 20}}>{messages?.captured || "Vous avez été éliminé..."}</Text>
                    </View>  
                }
                { gameState == GameState.FINISHED &&
                    <View style={[styles.timersContainer, {height: 61}]}>
                        {captured && <Text style={{fontSize: 20}}>{captured ? (messages?.loser || "Vous avez perdu...") : (messages?.winner || "Vous avez gagné !")}</Text>}
                    </View>
                }
            </View>
            <View style={styles.bottomContainer} onLayout={(event) => setBottomContainerHeight(event.nativeEvent.layout.height)}>
                <CustomMap/>
                <Drawer height={bottomContainerHeight}/>
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
    }
});
