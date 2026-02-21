// React
import { useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Text, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
// Contexts
import { useTeam } from '@/contexts/teamContext';
// Hook
import { useTimeSinceSeconds } from '@/hooks/useTimeDelta';
// Util
import { secondsToHHMMSS } from '@/utils/functions';

const Stat = ({ children, source, description }) => {
    const { t } = useTranslation();

    return (
        <TouchableOpacity style={styles.statContainer} onPress={description ? () => Alert.alert(t("info.default.title"), description) : null}>
            <Image style={styles.image} source={source} resizeMode="contain"/>
            <Text style={styles.text}>{children}</Text>
        </TouchableOpacity>
    );
};

export const TeamStats = () => {
    const { t } = useTranslation();
    const { teamInfos, startDate } = useTeam();
    const { distance, finishDate, nCaptures, nSentLocation } = teamInfos;
    const timeSinceGameStart = useTimeSinceSeconds(startDate);

    const avgSpeed = useMemo(() => {
        const hours = (finishDate ? (finishDate - startDate) : timeSinceGameStart*1000) / 1000 / 3600;
        if (hours <= 0 || distance <= 0) return 0;
        const km = distance / 1000;
        const speed = km / hours;

        return parseFloat(speed.toFixed(1));
    }, [finishDate, startDate, timeSinceGameStart, distance]);

    return (
        <View style={styles.statsContainer}>
            <Text style={styles.title}>{t("play.drawer.stats_section_title")}</Text>
            <View style={styles.row}>
                <Stat source={require('@/assets/images/distance.png')} description={t("play.drawer.stat_distance_label")}>{Math.floor((distance ?? 0) / 100) / 10}km</Stat>
                <Stat source={require('@/assets/images/time.png')} description={t("play.drawer.stat_time_label")}>{secondsToHHMMSS((finishDate ? Math.floor((finishDate - startDate) / 1000) : timeSinceGameStart))}</Stat>
                <Stat source={require('@/assets/images/running.png')} description={t("play.drawer.stat_speed_label")}>{avgSpeed}km/h</Stat>
            </View>
            <View style={styles.row}>
                <Stat source={require('@/assets/images/target/black.png')} description={t("play.drawer.stat_capture_label")}>{nCaptures ?? 0}</Stat>
                <Stat source={require('@/assets/images/update_position.png')} description={t("play.drawer.stat_reveal_label")}>{nSentLocation ?? 0}</Stat>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    statsContainer: {
        width: "100%",
        gap: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    statContainer: {
        flexDirection: "row",
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
    },
    image: {
        width: 30,
        height: 30,
    },
    text: {
        fontSize: 15,
    },
});
