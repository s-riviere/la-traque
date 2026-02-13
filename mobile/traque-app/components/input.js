import { TextInput, StyleSheet } from 'react-native';

export default function CustomTextInput({ style, value, inputMode, placeholder, onChangeText }) {
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
        width: "100%",
        padding: 15,
        borderColor: '#777',
        borderRadius: 12,
        borderWidth: 2,
        backgroundColor: '#fff',
        fontSize: 20,
    },
});
