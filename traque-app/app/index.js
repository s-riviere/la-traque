// React
import { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Image, Alert } from 'react-native';
// Expo
import { useRouter } from 'expo-router';
// Components
import CustomButton from '../components/button';
import CustomImage from '../components/image';
import CustomTextInput from '../components/input';
// Other
import { useSocket } from '../context/socketContext';
import { useTeamContext } from '../context/teamContext';
import { useTeamConnexion } from "../context/teamConnexionContext";
import { usePickImage } from '../hook/usePickImage';

const backgroundColor = '#f5f5f5';

export default function Index() {
    const router = useRouter();
    const {SERVER_URL} = useSocket();
    const {login, loggedIn, loading} = useTeamConnexion();
    const {getLocationAuthorization, stopLocationTracking} = useTeamContext();
    const {image, pickImage, sendImage} = usePickImage();
    const [teamID, setTeamID] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Disbaling location tracking
    useEffect(() => {
        stopLocationTracking();
    }, []);

    // Routeur
    useEffect(() => {
        if (!loading && loggedIn) {
            router.replace("/display");
        }
    }, [loggedIn, loading]);

    function handleSubmit() {
        if (!isSubmitting && !loading) {
            setIsSubmitting(true);
            if (getLocationAuthorization()) {
                login(parseInt(teamID))
                    .then((response) => {
                        if (response.isLoggedIn) {
                            sendImage(`${SERVER_URL}/upload?team=${teamID}`);
                        } else {
                            Alert.alert("Échec", "L'ID d'équipe est inconnu.");
                        }
                        setIsSubmitting(false);
                    })
                    .catch(() => {
                        Alert.alert("Échec", "La connection au serveur a échoué.");
                        setIsSubmitting(false);
                    });
            }
            setTeamID("");
        }
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.transitionContainer}>
                <View style={styles.subContainer}>
                    <Image style={styles.logoImage} source={require('../assets/images/logo/logo_traque.png')}/>
                    <Text style={styles.logoText}>LA TRAQUE</Text>
                </View>
                <View style={styles.subContainer}>
                    <CustomTextInput value={teamID} inputMode="numeric" placeholder="ID de l'équipe" style={styles.input} onChangeText={setTeamID}/>
                </View>
                <View style={styles.subContainer}>
                    <Text style={{fontSize: 15}}>Appuyer pour changer la photo d'équipe</Text>
                    <Text style={{fontSize: 13, marginBottom: 3}}>(Le haut du corps doit être visible)</Text>
                    <CustomImage source={image ? {uri: image.uri} : require('../assets/images/missing_image.jpg')} onPress={pickImage}/>
                </View>
                <View style={styles.subContainer}>
                     <CustomButton label={(isSubmitting || loading) ? "..." : "Valider"} onPress={handleSubmit}/>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: backgroundColor
    },
    transitionContainer: {
        flexGrow: 1,
        width: '80%',
        maxWidth: 600,
        alignItems: 'center',
    },
    subContainer: {
        flexGrow: 1,
        width: "100%",
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10,
    },
    logoImage: {
        width: 130,
        height: 130,
        margin: 10,
    },
    logoText: {
        fontSize: 50,
        fontWeight: 'bold',
    }
});
