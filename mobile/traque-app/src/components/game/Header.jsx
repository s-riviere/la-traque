// React
import { View, Text, Alert, StyleSheet } from 'react-native';
// Contexts
import { useAuth } from '@/contexts/authContext';
import { useTeam } from '@/contexts/teamContext';
// Components
import { IconButton } from '@/components/common/IconButton';

export const Header = () => {
    const { logout } = useAuth();
    const { teamInfos } = useTeam();
    const { name } = teamInfos;

    return (
        <View style={styles.container}>
            <View style={styles.buttonsContainer}>
                <IconButton source={require('@/assets/images/logout.png')} onPress={logout} />
                <IconButton source={require('@/assets/images/cogwheel.png')} onPress={() => Alert.alert("Settings")} />
            </View>          
            <View style={styles.nameContainer}>
                <Text style={styles.name}>{name ?? "Inconnue"}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center'
    },
    buttonsContainer: {
        width: "100%",
        flexDirection: "row",
        justifyContent: 'space-between'
    },
    nameContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    name: {
        fontSize: 36,
        fontWeight: "bold"
    }
});
