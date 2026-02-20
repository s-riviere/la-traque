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
import { USER_STATE } from '@/constants';
import { useCountdownSeconds } from '@/hooks/useTimeDelta';

export const Toasts = () => {
    const { t } = useTranslation();
    const { teamInfos } = useTeam();
    const { outOfZone, outOfZoneDeadline, hasHandicap, enemyHasHandicap, ready } = teamInfos;
    const userState = useUserState();
    const outOfZoneTimeLeft = useCountdownSeconds(outOfZoneDeadline);

    const toastData = [
        {
            condition: userState === USER_STATE.PLACEMENT,
            id: 'placement',
            text: ready ? t("interface.placed") : t("interface.not_placed"),
            toastColor: ready ? "rgb(25, 165, 25)" : "rgb(204, 51, 51)" ,
            textColor: "white"
        },
        {
            condition: userState === USER_STATE.PLAYING && !outOfZone && enemyHasHandicap,
            id: 'enemy_revealed',
            text: t("interface.enemy_position_revealed"),
            toastColor: "white",
            textColor: "black"
        },
        {
            condition: userState === USER_STATE.PLAYING && outOfZone && hasHandicap,
            id: 'out_of_zone',
            text: `${t("interface.go_in_zone")}\n${t("interface.team_position_revealed")}`,
            toastColor: "white",
            textColor: "black"
        },
        {
            condition: userState === USER_STATE.PLAYING && outOfZone && !hasHandicap,
            id: 'has_handicap',
            text: `${t("interface.go_in_zone")}\n${t("interface.out_of_zone_message", {time: secondsToMMSS(outOfZoneTimeLeft)})}`,
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
        top: 5,
        left: "50%",
        transform: [{ translateX: '-50%' }],
        maxWidth: "60%"
    },
    toast: {
        margin: 5,
        padding: 10,
        borderRadius: 15,
        backgroundColor: 'white',
        elevation: 5
    },
});
