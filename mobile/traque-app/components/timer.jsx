// React
import { View, Text, StyleSheet } from 'react-native';
// Util
import { secondsToMMSS } from '../util/functions';

export const TimerMMSS = ({ title, seconds, style }) => {
    return (
        <View style={[styles.container, style]}>
            <Text style={{fontSize: 15}}>{title}</Text>
            <Text style={{fontSize: 30, fontWeight: "bold"}}>{secondsToMMSS(seconds)}</Text> 
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    }
});
