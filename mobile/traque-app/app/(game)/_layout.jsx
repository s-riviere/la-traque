// React
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
// Expo
import { Slot } from 'expo-router';
// Contexts
import { useAuth } from '@/contexts/authContext';
import { useTeam } from '@/contexts/teamContext';
// Components
import { IconButton } from '@/components/common/IconButton';
// Constants
import { COLORS } from '@/constants';

const GameLayout = () => {
    const { t, i18n } = useTranslation();
    const { logout } = useAuth();
    const { teamInfos } = useTeam();
    const { name } = teamInfos;

    const toggleLanguage = () => {
        i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr');
    };

    const formatText = (text, limit) => {
        if (text == null) return t("common.no_value");

        if (text.length > limit) {
            return text.substring(0, limit) + "...";
        } else {
            return text;
        }
    };

    formatText("les minions du bds qui gagne");

    return (
        <View style={styles.globalContainer}>
            <View style={styles.headerContainer}>
                <IconButton style={styles.logoutIcon} source={require('@/assets/images/logout.png')} onPress={logout} />
                <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit>{formatText(name, 22)}</Text>
                <IconButton style={styles.traductionIcon} source={require('@/assets/images/language.png')} onPress={toggleLanguage} />
            </View>
            <Slot/>
        </View>
    ); 
};

export default GameLayout;

const styles = StyleSheet.create({
    globalContainer: {
        flex: 1
    },
    headerContainer: {
        backgroundColor: COLORS.background,
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        gap: 10,
        elevation: 10,
    },
    name: {
        fontSize: 30,
        fontWeight: "bold",
        textAlign: "center",
        flex: 1
    }, 
    logoutIcon: {
        width: 50,
        height: 50
    },
    traductionIcon: {
        width: 60,
        height: 60
    }
});
