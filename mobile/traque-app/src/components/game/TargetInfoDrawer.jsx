// React
import { useState } from 'react';
import { Keyboard, View, Text, StyleSheet, Alert } from 'react-native';
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
import { IconButton } from '../common/IconButton';

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
        <Drawer contentContainerStyle={styles.drawer} height={height}>
            <Text style={styles.teamCode}>{t("play.drawer.capture_code", {name: name ?? t("common.no_value"), code: String(captureCode).padStart(4,"0")})}</Text>
            <Show when={!hasHandicap}>
                <View style={styles.targetContainer}>
                    <Text style={styles.targetName}>{t("play.drawer.target_name", {name: enemyName ?? t("common.no_value")})}</Text>
                    <ExpandableImage source={enemyImage(teamId)}/>
                </View>
                <View style={styles.captureContainer}>
                    <CustomTextInput style={styles.captureInput} value={enemyCaptureCode} inputMode="numeric" placeholder={t("play.drawer.target_code_input")}  onChangeText={setEnemyCaptureCode}/>
                    <IconButton style={styles.captureButton} source={require("@/assets/images/target/white.png")} onPress={handleCapture} />
                </View>
            </Show>
            <TeamStats/>
        </Drawer>
    );
};

const styles = StyleSheet.create({
    drawer: {
        flexGrow: 1,
        justifyContent: "space-between",
        padding: 15,
        gap: 15,
    },
    teamCode: {
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center"
    },
    targetContainer: {
        width: "100%", 
        alignItems: "center", 
        justifyContent: "center"
    },
    targetName: {
        fontSize: 15,
    },
    captureContainer: {
        flexDirection: "row",
        width: "100%",
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 15
    },
    captureInput: {
        flex: 3,
        alignItems: 'center',
        justifyContent: 'center'
    },
    captureButton: {
        flex: 1,
        height: 70,
        borderRadius: 12,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#444'
    },
});
