// React
import { ScrollView, View, Text, StyleSheet, Image } from 'react-native';
import { useTranslation } from 'react-i18next';

const Section = ({ source, text }) => {
    return (
        <View style={styles.section}>
            <Image style={styles.image} source={source} />
            <Text style={styles.description}>{text}</Text>
        </View>
    );
};

const Wait = () => {
    const { t } = useTranslation();

    return (
        <ScrollView style={styles.outerScrollview} contentContainerStyle={styles.innerScrollview} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{t("wait.title")}</Text>
            <Section source={require("@/assets/images/flag.png")} text={t("wait.placement_rule")} />
            <Section source={require("@/assets/images/target/black.png")} text={t("wait.capture_rule")} />
            <Section source={require("@/assets/images/running.png")} text={t("wait.zone_rule")} />
            <Section source={require("@/assets/images/team.png")} text={t("wait.team_rule")} />
        </ScrollView>
    );
};

export default Wait;

const styles = StyleSheet.create({
    outerScrollview: {
        flex: 1
    },
    innerScrollview: {
        flexGrow: 1,
        justifyContent: "space-between",
        alignItems: 'center',
        padding: 30,
        gap: 30
    },
    title: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: "bold"
    },
    section: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 30,
    },
    image: {
        width: 70,
        height: 70,
    },
    description: {
        flex: 1,
        fontSize: 15,
    }
});
