// React
import { useState, useEffect, useMemo, Fragment } from 'react';
import { View, Text, Image, Alert, StyleSheet, TouchableOpacity } from 'react-native';
// Expo
import { useRouter } from 'expo-router';
// Components
import { CustomMap } from '../src/components/map';
import { Drawer } from '../src/components/drawer';
import { TimerMMSS } from '../src/components/timer';
// Contexts
import { useAuth } from '../src/contexts/authContext';
import { useTeam } from '../src/contexts/teamContext';
// Hooks
import { useTimeDifference } from '../src/hooks/useTimeDifference';
// Services
import { emitSendPosition } from '../src/services/socket/emitters';
import { startLocationTracking } from '../src/services/tasks/backgroundLocation';
// Util
import { secondsToMMSS } from '../src/utils/functions';
// Constants
import { GAME_STATE, COLORS } from '../src/constants';

const Interface = () => {
    const router = useRouter();
    const {teamInfos, messages, nextZoneDate, gameState} = useTeam();
    const {name, ready, captured, locationSendDeadline, outOfZone, outOfZoneDeadline, hasHandicap, enemyHasHandicap} = teamInfos;
    const { loggedIn, logout } = useAuth();
    const [timeLeftSendLocation] = useTimeDifference(locationSendDeadline, 1000);
    const [timeLeftNextZone] = useTimeDifference(nextZoneDate, 1000);
    const [timeLeftOutOfZone] = useTimeDifference(outOfZoneDeadline, 1000);
    const [bottomContainerHeight, setBottomContainerHeight] = useState(0);
    
    const statusMessage = useMemo(() => {
        switch (gameState) {
            case GAME_STATE.SETUP:
                return messages?.waiting || "Préparation de la partie";
            case GAME_STATE.PLACEMENT:
                return "Phase de placement";
            case GAME_STATE.PLAYING:
                if (captured) return messages?.captured || "Vous avez été éliminé...";
                if (!outOfZone) return "La partie est en cours";
                if (!hasHandicap) return `Veuillez retourner dans la zone\nHandicap dans ${secondsToMMSS(-timeLeftOutOfZone)}`;
                else return `Veuillez retourner dans la zone\nVotre position est révélée en continue`;
            case GAME_STATE.FINISHED:
                return `Vous avez ${captured ? (messages?.loser || "perdu...") : (messages?.winner || "gagné !")}`;
            default:
                return "Inconnue";
        }
    }, [gameState, messages, outOfZone, hasHandicap, timeLeftOutOfZone, captured]);

    // Router
    useEffect(() => {
        if (!loggedIn) {
            router.replace("/");
        }
    }, [router, loggedIn]);

    // Activating geolocation tracking
    useEffect(() => {
        startLocationTracking();
    }, []);

    return (
        <View style={styles.globalContainer}>
            <View style={styles.topContainer}>
                <View style={styles.topheadContainer}>
                    <TouchableOpacity style={{width: 40, height: 40}} onPress={logout}>
                        <Image source={require('../src/assets/images/logout.png')} style={{width: 40, height: 40}} resizeMode="contain"></Image>
                    </TouchableOpacity>
                    <TouchableOpacity style={{width: 40, height: 40}} onPress={() => Alert.alert("Settings")}>
                        <Image source={require('../src/assets/images/cogwheel.png')} style={{width: 40, height: 40}} resizeMode="contain"></Image>
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
                    { gameState == GAME_STATE.PLACEMENT &&
                        <View style={[styles.readyIndicator, {backgroundColor: ready ? "#3C3" : "#C33"}]}>
                            <Text style={{color: '#fff', fontSize: 16}}>{ready ? "Placé" : "Non placé"}</Text>
                        </View>
                    }
                    { gameState == GAME_STATE.PLAYING && !captured && <Fragment>
                        <TimerMMSS style={{width: "50%"}} title={"Réduction de la zone dans"} seconds={-timeLeftNextZone} />
                        <TimerMMSS style={{width: "50%"}} title={"Position envoyée dans"} seconds={!hasHandicap ? -timeLeftSendLocation: 0} />
                    </Fragment>}
                </View>
                { enemyHasHandicap &&
                    <Text style={{fontSize: 18, marginTop: 6, fontWeight: "bold"}}>Position ennemie révélée en continue !</Text>
                }
            </View>
            <View style={styles.bottomContainer} onLayout={(event) => setBottomContainerHeight(event.nativeEvent.layout.height)}>
                <CustomMap/>
                { gameState == GAME_STATE.PLAYING && !captured && !hasHandicap &&
                    <TouchableOpacity style={styles.updatePosition} onPress={emitSendPosition}>
                        <Image source={require("../src/assets/images/update_position.png")} style={{width: 40, height: 40}} resizeMode="contain"></Image>
                    </TouchableOpacity>
                }
                { gameState == GAME_STATE.PLAYING && !captured &&
                    <Drawer height={bottomContainerHeight}/>
                }
            </View>
        </View>
    );
};

export default Interface;

const styles = StyleSheet.create({
    globalContainer: {
        backgroundColor: COLORS.background,
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
