// React
import { useState } from 'react';
import { Text, View, Alert, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
// Components
import { Map } from '@/components/common/Map';
import { TimerMMSS } from '@/components/common/Timer';
import { Show } from '@/components/common/Show';
import { PositionMarker } from '@/components/common/Layers';
import { IconButton } from '@/components/common/IconButton';
import { TargetInfoDrawer } from '@/components/game/TargetInfoDrawer';
import { Toasts } from '@/components/game/Toasts';
import { GameZone, StartZone } from '@/components/game/MapLayers';
// Contexts
import { useTeam } from '@/contexts/teamContext';
// Hooks
import { useLocation } from '@/hooks/useLocation';
import { useUserState } from '@/hooks/useUserState';
// Services
import { emitSendPosition } from '@/services/socket/emitters';
// Constants
import { USER_STATE } from '@/constants';

const Play = () => {
    const { t } = useTranslation();
    const { teamInfos, nextZoneDate } = useTeam();
    const { locationSendDeadline, hasHandicap, enemyLocation, lastSentLocation } = teamInfos;
    const { location } = useLocation();
    const userState = useUserState();
    const [bottomContainerHeight, setBottomContainerHeight] = useState(0);

    return (
        <View style={styles.globalContainer}>
            <Show when={userState == USER_STATE.PLACEMENT}>
                <Text style={styles.placementTitle}>{t("play.info.placement_title")}</Text>
            </Show>
            <Show when={userState == USER_STATE.PLAYING}>
                <View style={styles.timerContainer}>
                    <TimerMMSS style={styles.timer} title={t("play.info.zone_reduction_label")} date={nextZoneDate} />
                    <TimerMMSS style={styles.timer} title={t("play.info.send_position_label")} date={locationSendDeadline} />
                </View>
            </Show>
            <View style={styles.mapContainer} onLayout={(event) => setBottomContainerHeight(event.nativeEvent.layout.height)}>
                <Map location={location}>
                    <Show when={userState == USER_STATE.PLACEMENT}>
                        <StartZone/>
                    </Show>
                    <Show when={userState == USER_STATE.PLAYING}>
                        <GameZone/>
                    </Show>
                    <Show when={userState == USER_STATE.PLAYING && !hasHandicap}>
                        <PositionMarker position={lastSentLocation} color={"grey"} onPress={() => Alert.alert(t("play.map.previous_marker_title"), t("play.map.previous_marker_description"))} />
                        <PositionMarker position={enemyLocation} color={"red"} onPress={() => Alert.alert(t("play.map.enemy_marker_title"), t("play.map.enemy_marker_description"))} />
                    </Show>
                </Map>
                <LinearGradient colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0)']} style={styles.gradient}/>
                <Show when={userState == USER_STATE.PLAYING && !hasHandicap}>
                    <IconButton style={styles.updatePosition} source={require("@/assets/images/update_position.png")} onPress={() => location && emitSendPosition(location)} />
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
        flex: 1,
    },
    placementTitle: {
        textAlign: "center",
        padding: 15,
        fontSize: 20,
        fontWeight: "bold"
    },
    timerContainer: {
        padding: 15,
        alignItems: 'center',
        flexDirection: 'row',
    },
    timer: {
        width: "50%",
    },
    mapContainer: {
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
