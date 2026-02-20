// React
import { View, Text, StyleSheet } from 'react-native';
// Util
import { secondsToMMSS } from '@/utils/functions';
import { useCountdownSeconds } from '@/hooks/useTimeDelta';

export const TimerMMSS = ({ title, date, style }) => {
    const timeUntilDate = useCountdownSeconds(date);

    return (
        <View style={[styles.container, style]}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.timer}>{secondsToMMSS(timeUntilDate)}</Text> 
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 15
    },
    timer: {
        fontSize: 30,
        fontWeight: "bold"
    }
});
