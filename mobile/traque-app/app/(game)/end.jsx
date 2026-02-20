// React
import { View, Text, StyleSheet } from 'react-native';
// Components
import { Header } from '@/components/game/Header';
// Constants
import { COLORS } from '@/constants';

const End = () => {
    return (
        <View style={styles.globalContainer}>
            <View style={styles.topContainer}>
                <Header/>
                <Text>Fin de la partie !</Text>
            </View>
        </View>
    );
};

export default End;

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
