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
        <ScrollView style={styles.outerScrollContainer} contentContainerStyle={styles.innerScrollContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.logoContainer}>
                <Image style={styles.logoImage} source={require('@/assets/images/logo/logo_traque.png')}/>
                <Text style={styles.logoText}>{t("login.header.title")}</Text>
            </View>
            <CustomTextInput style={styles.input} value={teamId} inputMode="numeric" placeholder={t("login.form.team_id_input")} onChangeText={setTeamId}/>
            <View style={styles.imageContainer}>
                <Text style={styles.imageLabel}>{t("login.form.image_label")}</Text>
                <Text style={styles.imageSubLabel}>{t("login.form.image_sublabel")}</Text>
                <TouchableImage source={image ? {uri: image.uri} : require('@/assets/images/missing_image.jpg')} onPress={pickImage}/>
            </View>
            <TouchableHighlight style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonLabel}>{isSubmitting ? "..." : t("login.form.validate_button")}</Text>
            </TouchableHighlight>
        </ScrollView>
    );
};

export default Login;

const styles = StyleSheet.create({
    outerScrollContainer: {
        flex: 1,
    },
    innerScrollContainer: {
        flexGrow: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
        gap: 20,
    },
    logoContainer: {
        justifyContent: "center",
        alignItems: 'center',
        gap: 10,
    },
    logoImage: {
        width: 130,
        height: 130,
    },
    logoText: {
        fontSize: 50,
        fontWeight: 'bold',
    },
    input: {
        width: "80%",
    },
    imageContainer: {
        justifyContent: "center",
        alignItems: 'center',
    },
    imageLabel: {
        fontSize: 15
    },
    imageSubLabel:{
        fontSize: 13
    },
    button: {
        borderRadius: 10,
        width: 200,
        height: 70,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#555' 
    },
    buttonLabel: {
        color: '#fff',
        fontSize: 20,
    },
});
