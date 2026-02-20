// React
import { View, Text, StyleSheet } from 'react-native';
// Components
import { Header } from '@/components/game/Header';
// Constants
import { COLORS } from '@/constants';

const Wait = () => {
    return (
        <View style={styles.globalContainer}>
            <View style={styles.topContainer}>
                <Header/>
                <Text>Veuillez patienter, la partie va bientôt commencer !</Text>
            </View>
        </View>
    );
};

export default Wait;

const styles = StyleSheet.create({
    globalContainer: {
        backgroundColor: COLORS.background,
        flex: 1,
    },
    topContainer: {
        width: '100%',
        alignItems: 'center',
        padding: 15,
    }
});
