// React
import { TextInput, StyleSheet } from 'react-native';

export const CustomTextInput = ({ style = {}, value, inputMode, placeholder, onChangeText }) => {
    return (
        <TextInput
            value={value}
            inputMode={inputMode}
            style={[styles.input, style]}
            placeholder={placeholder}
            multiline={false}
            onChangeText={onChangeText}
        />
    );
};

const styles = StyleSheet.create({
    input: {
        padding: 15,
        borderColor: '#777',
        borderRadius: 12,
        borderWidth: 2,
        backgroundColor: '#fff',
        fontSize: 20,
    },
});
