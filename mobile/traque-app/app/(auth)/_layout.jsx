// React
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
// Expo
import { Slot } from 'expo-router';
// Components
import { IconButton } from '@/components/common/IconButton';

const AuthLayout = () => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr');
    };

    return (
        <View style={styles.globalContainer}>
            <Slot/>
            <IconButton style={styles.languageButton} source={require('@/assets/images/language.png')} onPress={toggleLanguage} />
        </View>
    ); 
};

export default AuthLayout;

const styles = StyleSheet.create({
    globalContainer: {
        flex: 1
    },
    languageButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 60,
        height: 60,
        backgroundColor: "rgb(126, 182, 199)",
        borderBottomLeftRadius: 20,
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
