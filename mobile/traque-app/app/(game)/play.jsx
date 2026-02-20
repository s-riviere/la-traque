// React
import { useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
// Components
import { Map } from '@/components/common/Map';
import { TimerMMSS } from '@/components/common/Timer';
import { Show } from '@/components/common/Show';
import { PositionMarker } from '@/components/common/Layers';
import { IconButton } from '@/components/common/IconButton';
import { Header } from '@/components/game/Header';
import { TargetInfoDrawer } from '@/components/game/TargetInfoDrawer';
import { Toasts } from '@/components/game/Toasts';
import { GameZone, StartZone } from '@/components/game/MapLayers';
// Contexts
import { useTeam } from '@/contexts/teamContext';
// Hooks
import { useUserState } from '@/hooks/useUserState';
// Services
import { emitSendPosition } from '@/services/socket/emitters';
// Constants
import { COLORS, USER_STATE } from '@/constants';

const Play = () => {
    const { t } = useTranslation();
    const { teamInfos, nextZoneDate } = useTeam();
    const { locationSendDeadline, hasHandicap, enemyLocation, lastSentLocation } = teamInfos;
    const userState = useUserState();
    const [bottomContainerHeight, setBottomContainerHeight] = useState(0);

    return (
        <View style={styles.globalContainer}>
            <View style={styles.topContainer}>
                <Header/>
                <Show when={userState == USER_STATE.PLAYING}>
                    <View style={styles.infoContainer}>
                        <TimerMMSS style={{width: "50%"}} title={t("interface.zone_reduction_label")} date={nextZoneDate} />
                        <TimerMMSS style={{width: "50%"}} title={t("interface.send_position_label")} date={locationSendDeadline} />
                    </View>
                </Show>
            </View>
            <View style={styles.bottomContainer} onLayout={(event) => setBottomContainerHeight(event.nativeEvent.layout.height)}>
                <Map>
                    <Show when={userState == USER_STATE.PLACEMENT}>
                        <StartZone/>
                    </Show>
                    <Show when={userState == USER_STATE.PLAYING}>
                        <GameZone/>
                    </Show>
                    <Show when={userState == USER_STATE.PLAYING && !hasHandicap}>
                        <PositionMarker position={lastSentLocation} color={"grey"} onPress={() => Alert.alert(t("interface.map.previous_marker_title"), t("interface.map.previous_marker_description"))} />
                        <PositionMarker position={enemyLocation} color={"red"} onPress={() => Alert.alert(t("interface.map.enemy_marker_title"), t("interface.map.enemy_marker_description"))} />
                    </Show>
                </Map>
                <LinearGradient colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0)']} style={styles.gradient}/>
                <Show when={userState == USER_STATE.PLAYING && !hasHandicap}>
                    <IconButton style={styles.updatePosition} source={require("@/assets/images/update_position.png")} onPress={emitSendPosition} />
                </Show>
                <Toasts/>
            </View>
            <Show when={userState == USER_STATE.PLAYING}>
                <TargetInfoDrawer height={bottomContainerHeight}/>
            </Show>
        </View>
    );
};

export default Play;

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
    infoContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginTop: 15
    },
    bottomContainer: {
        flex: 1,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden',
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
        borderColor: 'black'
    },
    gradient: {
        position: "absolute",
        width: "100%",
        height: 40,
    }
});
