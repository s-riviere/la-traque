// React
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
// Components
import { Header } from '@/components/game/Header';
// Constants
import { COLORS } from '@/constants';

const Wait = () => {
    const { t } = useTranslation();

    return (
        <View style={styles.globalContainer}>
            <Header/>
            <View style={styles.rulesContainer}>
                <Text style={styles.title}>{t("wait.title")}</Text>
                <View style={styles.section}>
                    <Image style={styles.image} source={require("@/assets/images/flag.png")} />
                    <Text style={styles.description}>{t("wait.placement_rule")}</Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.description}>{t("wait.capture_rule")}</Text>
                    <Image style={styles.image} source={require("@/assets/images/target/black.png")} />
                </View>
                <View style={styles.section}>
                    <Image style={styles.image} source={require("@/assets/images/running.png")} />
                    <Text style={styles.description}>{t("wait.zone_rule")}</Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.description}>{t("wait.team_rule")}</Text>
                    <Image style={styles.image} source={require("@/assets/images/team.png")} />
                </View>
            </View>
        </View>
    );
};

export default Wait;

const styles = StyleSheet.create({
    globalContainer: {
        backgroundColor: COLORS.background,
        flex: 1,
        padding: 20,
    },
    rulesContainer: {
        flex: 1,
        alignItems: 'center',
        gap: 30
    },
    title: {
        backgroundColor: "white",
        textAlign: 'center',
        fontSize: 30,
        fontWeight: "bold",
        borderWidth: 2,
        borderRadius: 10,
        padding: 10,
    },
    section: {
        width: '100%',
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
    },
    image: {
        width: 100,
        height: 100,
    },
    description: {
        flex: 1,
        
    }
});
