//React
import { StyleSheet, Text, View, Image } from 'react-native';
import { useTranslation } from 'react-i18next';

const LocationPermission = () => {
    const { t } = useTranslation();

    return (<>
        <View style={styles.container}>
            <Image style={styles.image} source={require("@/assets/images/placement.png")} />
            <Text style={styles.title}>{t("location-permission.title")}</Text>
            <Text style={styles.subtitle}>{t("location-permission.subtitle")}</Text>
        </View>
    </>); 
};

export default LocationPermission;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        gap: 20
    },
    image: {
        width: 150,
        height: 150,
        marginTop: -100,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
    },
    subtitle: {
        fontSize: 15,
    },
});
