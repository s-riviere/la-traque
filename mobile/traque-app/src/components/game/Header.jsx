// React
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
// Contexts
import { useAuth } from '@/contexts/authContext';
import { useTeam } from '@/contexts/teamContext';
// Components
import { IconButton } from '@/components/common/IconButton';

export const Header = () => {
    const { t } = useTranslation();
    const { logout } = useAuth();
    const { teamInfos } = useTeam();
    const { name } = teamInfos;

    return (
        <View style={styles.container}>
            <IconButton source={require('@/assets/images/logout.png')} onPress={logout} />
            <View style={styles.nameContainer}>
                <Text style={styles.name}>{name ?? t("common.no_value")}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    nameContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20
    },
    name: {
        fontSize: 36,
        fontWeight: "bold"
    }
});
