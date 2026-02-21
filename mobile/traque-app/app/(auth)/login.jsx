// React
import { useState } from 'react';
import { Keyboard, ScrollView, View, Text, StyleSheet, Image, Alert, TouchableHighlight } from 'react-native';
import { useTranslation } from 'react-i18next';
// Components
import { TouchableImage } from '@/components/common/Image';
import { CustomTextInput } from '@/components/common/Input';
// Contexts
import { useAuth } from "@/contexts/authContext";
// Hooks
import { usePickImage } from '@/hooks/usePickImage';
// Services
import { uploadTeamImage } from '@/services/api/image';
// Constants
import { COLORS } from '@/constants';

const Login = () => {
    const { t } = useTranslation();
    const { login } = useAuth();
    const { image, pickImage } = usePickImage();
    const [teamId, setTeamId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (isSubmitting) return;

        setIsSubmitting(true);

        const regex = /^\d{6}$/;
        if (!regex.test(teamId)) {
            Keyboard.dismiss();
            Alert.alert(t("error.default.title"), t("error.default.invalid_team_id"));
            setIsSubmitting(false);
            return;
        }
        
        try {
            const response = await login(teamId);

            if (response) {
                uploadTeamImage(teamId, image?.uri);
                setTeamId("");
            } else {
                Keyboard.dismiss();
                Alert.alert(t("error.default.title"), t("error.default.unknown_team_id"));
            }
        } catch (error) {
            Keyboard.dismiss();
            Alert.alert(t("error.default.title"), t("error.default.server_connection"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.transitionContainer}>
                <View style={styles.subContainer}>
                    <Image style={styles.logoImage} source={require('@/assets/images/logo/logo_traque.png')}/>
                    <Text style={styles.logoText}>{t("login.header.title")}</Text>
                </View>
                <View style={styles.subContainer}>
                    <CustomTextInput value={teamId} inputMode="numeric" placeholder={t("login.form.team_id_input")} style={styles.input} onChangeText={setTeamId}/>
                </View>
                <View style={styles.subContainer}>
                    <Text style={{fontSize: 15}}>{t("login.form.image_label")}</Text>
                    <Text style={{fontSize: 13, marginBottom: 3}}>{t("login.form.image_sublabel")}</Text>
                    <TouchableImage source={image ? {uri: image.uri} : require('@/assets/images/missing_image.jpg')} onPress={pickImage}/>
                </View>
                <View style={styles.subContainer}>
                    <View style={styles.buttonContainer}>
                        <TouchableHighlight style={styles.button} onPress={handleSubmit}>
                            <Text style={styles.buttonLabel}>{isSubmitting ? "..." : t("login.form.validate_button")}</Text>
                        </TouchableHighlight>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

export default Login;

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
    },
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
