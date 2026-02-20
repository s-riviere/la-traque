// React
import { TouchableOpacity, Image, StyleSheet } from 'react-native';

export const IconButton = ({ style = {}, source, onPress = () => {} }) => {
    return (
        <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
            <Image source={source} style={styles.icon} resizeMode="contain" />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        width: "80%",
        height: "80%",
    },
});
