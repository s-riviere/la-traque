// React
import { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Image, Alert } from 'react-native';
// Expo
import { useRouter } from 'expo-router';
// Components
import { CustomButton } from '../components/button';
import { CustomImage } from '../components/image';
import { CustomTextInput } from '../components/input';
// Contexts
import { useTeamConnexion } from "../context/teamConnexionContext";
// Hooks
import { usePickImage } from '../hook/usePickImage';
// Services
import { uploadTeamImage } from '../services/imageService';
import { getLocationAuthorization, stopLocationTracking } from '../services/backgroundLocationTask';
// Constants
import { COLORS } from '../constants';

const Index = () => {
    const router = useRouter();
    const { login, loggedIn } = useTeamConnexion();
    const {image, pickImage} = usePickImage();
    const [teamId, setTeamId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Disbaling location tracking and asking permissions
    useEffect(() => {
        stopLocationTracking();
        getLocationAuthorization();
    }, []);

    // Routeur
    useEffect(() => {
        if (loggedIn) {
            router.replace("/interface");
        }
    }, [router, loggedIn, image]);

    const handleSubmit = async () => {
        if (isSubmitting || !getLocationAuthorization()) return;

        setIsSubmitting(true);

        const regex = /^\d{6}$/;
        if (!regex.test(teamId)) {
            setTimeout(() => Alert.alert("Erreur", "Veuillez entrer un ID d'équipe valide."), 100);
            return;
        }
        
        try {
            const response = await login(teamId);

            if (response.isLoggedIn) {
                uploadTeamImage(teamId, image?.uri);
                setTeamId("");
            } else {
                setTimeout(() => Alert.alert("Échec", "L'ID d'équipe est inconnu."), 100);
            }
        } catch (error) {
            setTimeout(() => Alert.alert("Échec", "La connexion au serveur a échoué."), 100);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.transitionContainer}>
                <View style={styles.subContainer}>
                    <Image style={styles.logoImage} source={require('../assets/images/logo/logo_traque.png')}/>
                    <Text style={styles.logoText}>LA TRAQUE</Text>
                </View>
                <View style={styles.subContainer}>
                    <CustomTextInput value={teamId} inputMode="numeric" placeholder="ID de l'équipe" style={styles.input} onChangeText={setTeamId}/>
                </View>
                <View style={styles.subContainer}>
                    <Text style={{fontSize: 15}}>Appuyer pour changer la photo d&apos;équipe</Text>
                    <Text style={{fontSize: 13, marginBottom: 3}}>(Le haut du corps doit être visible)</Text>
                    <CustomImage source={image ? {uri: image.uri} : require('../assets/images/missing_image.jpg')} onPress={pickImage}/>
                </View>
                <View style={styles.subContainer}>
                     <CustomButton label={isSubmitting ? "..." : "Valider"} onPress={handleSubmit}/>
                </View>
            </View>
        </ScrollView>
    );
};

export default Index;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: COLORS.background
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
