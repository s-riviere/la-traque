// React
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
// Contexts
import { useTeam } from '@/contexts/teamContext';
// Hooks
import { useUserState } from '@/hooks/useUserState';
// Util
import { secondsToMMSS } from '@/utils/functions';
// Constants
import { USER_STATE } from '@/config';
import { useCountdownSeconds } from '@/hooks/useTimeDelta';

export const Toasts = () => {
    const { t } = useTranslation();
    const { teamStateData } = useTeam();
    const { isOutOfZone, handicapDate, hasHandicap, targetHasHandicap, isInPlacementZone } = teamStateData;
    const userState = useUserState();
    const outOfZoneTimeLeft = useCountdownSeconds(handicapDate);

    const toastData = [
        {
            condition: userState === USER_STATE.PLACEMENT,
            id: 'placement',
            text: isInPlacementZone ? t("play.toast.placed") : t("play.toast.not_placed"),
            toastColor: isInPlacementZone ? "rgb(25, 165, 25)" : "rgb(204, 51, 51)" ,
            textColor: "white"
        },
        {
            condition: userState === USER_STATE.PLAYING && !isOutOfZone && targetHasHandicap,
            id: 'enemy_revealed',
            text: t("play.toast.enemy_position_revealed"),
            toastColor: "white",
            textColor: "black"
        },
        {
            condition: userState === USER_STATE.PLAYING && isOutOfZone && hasHandicap,
            id: 'out_of_zone',
            text: `${t("play.toast.go_in_zone")}\n${t("play.toast.team_position_revealed")}`,
            toastColor: "white",
            textColor: "black"
        },
        {
            condition: userState === USER_STATE.PLAYING && isOutOfZone && !hasHandicap,
            id: 'has_handicap',
            text: `${t("play.toast.go_in_zone")}\n${t("play.toast.out_of_zone_message", {time: secondsToMMSS(outOfZoneTimeLeft)})}`,
            toastColor: "white",
            textColor: "black"
        }
    ];

    return (
        <View style={styles.container}>
            {toastData.filter(item => item.condition).map((item) => (
                <View key={item.id} style={[styles.toast, {backgroundColor: item.toastColor}]}>
                    <Text style={{ color: item.textColor }}>
                        {item.text}
                    </Text>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: "50%",
        transform: [{ translateX: '-50%' }],
        maxWidth: "60%",
        padding: 10,
        gap: 5
    },
    toast: {
        padding: 10,
        borderRadius: 15,
        elevation: 5
    },
});
