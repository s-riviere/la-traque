// React
import { forwardRef } from 'react';
import { TouchableHighlight, View, Text, StyleSheet } from "react-native";

export const CustomButton = forwardRef(function CustomButton({ label, onPress }, ref) {
    return (
        <View style={styles.buttonContainer}>
            <TouchableHighlight style={styles.button} onPress={onPress} ref={ref}>
                <Text style={styles.buttonLabel}>{label}</Text>
            </TouchableHighlight>
        </View>
    );
});

const styles = StyleSheet.create({
    buttonContainer: {
        width: "100%",
        maxWidth: 240,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
        borderWidth: 4,
        borderColor: '#888',
        borderRadius: 18 
    },
    button: {
        borderRadius: 10,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#555' 
    },
    buttonLabel: {
        color: '#fff',
        fontSize: 16,
    },
});
