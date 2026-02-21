// React
import { useState } from 'react';
import { Keyboard, View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
// Components
import { ExpandableImage } from '@/components/common/Image';
import { CustomTextInput } from '@/components/common/Input';
import { Drawer } from '@/components/common/Drawer';
import { Show } from '@/components/common/Show';
import { TeamStats } from '@/components/game/TeamStats';
// Contexts
import { useAuth } from '@/contexts/authContext';
import { useTeam } from '@/contexts/teamContext';
// Services
import { emitCapture } from '@/services/socket/emitters';
import { enemyImage } from '@/services/api/image';

export const TargetInfoDrawer = ({ height }) => {
    const { t } = useTranslation();
    const { teamId } = useAuth();
    const { teamInfos } = useTeam();
    const { enemyName, captureCode, name, hasHandicap } = teamInfos;
    const [enemyCaptureCode, setEnemyCaptureCode] = useState("");
    const [isCapturing, setIsCapturing] = useState(false);
    
    const handleCapture = () => {
        if (isCapturing) return;
        
        setIsCapturing(true);

        emitCapture(enemyCaptureCode)
            .then((response) => {
                if (response.hasCaptured) {
                    Keyboard.dismiss();
                    Alert.alert(t("info.success.title"), t("info.success.capture_success"));
                    setEnemyCaptureCode("");
                } else {
                    Keyboard.dismiss();
                    Alert.alert(t("info.failure.title"), t("info.failure.capture_failure"));
                }
            })
            .catch(() => {
                Keyboard.dismiss();
                Alert.alert(t("error.default.title"), t("error.default.server_connection"));
            })
            .finally(() => setIsCapturing(false));
    };

    return (
        <Drawer height={height}>
            <Text style={{fontSize: 22, fontWeight: "bold", textAlign: "center"}}>
                {t("play.drawer.capture_code", {name: name ?? t("common.no_value"), code: String(captureCode).padStart(4,"0")})}
            </Text>
            <Show when={!hasHandicap}>
                <View style={styles.imageContainer}>
                    <Text style={{fontSize: 15, margin: 5}}>{t("play.drawer.target_name", {name: enemyName ?? t("common.no_value")})}</Text>
                    <ExpandableImage source={enemyImage(teamId)}/>
                </View>
                <View style={styles.actionsContainer}>
                    <View style={styles.actionsLeftContainer}>
                        <CustomTextInput value={enemyCaptureCode} inputMode="numeric" placeholder={t("play.drawer.target_code_input")}  onChangeText={setEnemyCaptureCode}/>
                    </View>
                    <View style={styles.actionsRightContainer}>
                        <TouchableOpacity style={styles.button} onPress={handleCapture}>
                            <Image source={require("@/assets/images/target/white.png")} style={{width: 40, height: 40}} resizeMode="contain"/>
                        </TouchableOpacity>
                    </View>
                </View>
            </Show>
            <TeamStats/>
        </Drawer>
    );
};

const styles = StyleSheet.create({
    imageContainer: {
        width: "100%", 
        alignItems: "center", 
        justifyContent: "center", 
        marginTop: 15
    },
    actionsContainer: {
        flexDirection: "row",
        width: "100%",
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 15
    },
    actionsLeftContainer: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15
    },
    actionsRightContainer: {
        width: 100,
        alignItems: 'center',
        justifyContent: 'center'
    },
    button: {
        borderRadius: 12,
        width: '100%',
        height: 75,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#444'
    },
});
