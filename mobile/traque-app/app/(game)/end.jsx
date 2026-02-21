// React
import { Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
// Components
import { TeamStats } from '@/components/game/TeamStats';
import { Show } from '@/components/common/Show';
// Hook
import { useUserState } from '@/hooks/useUserState';
// Constants
import { USER_STATE } from '@/constants';

/*
const Leaderboard = ({ teams }) => {
    return (
        <View style={styles.leaderboardContainer}>
            {teams.map((item, index) => {
                const isSelected = index+1 == 5;
                return (
                    <View key={`leaderboard-${item}-${index+1}`} style={[styles.item, isSelected && styles.selectedTeam]}>
                        <Text style={styles.rank}>{index + 1}</Text>
                        <Text style={[styles.teamName, isSelected && styles.selectedTeam]}>
                        {item}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
};

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Classement</Text>
                <Leaderboard teams={teamsTest}/>
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Parcours</Text>
                <View style={styles.mapView}>
                    <MapView style={styles.map} mapType={"standard"} initialRegion={INITIAL_REGIONS.TELECOM_PARIS} toolbarEnabled={false}>
                    </MapView>
                </View>
            </View>


    mapView: {
        height: 300,
        borderRadius: 20,
        overflow: "hidden"
    },
    map: {
        flex: 1
    },

    // Classement
    leaderboardContainer: {
        gap: 8,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        borderWidth: 2,
        gap: 20
    },
    selectedTeam: {
        backgroundColor: 'rgb(126, 182, 199)',
    },
    rank: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
    },
    teamName: {
        fontSize: 16,
        color: '#000000',
    },
*/

const End = () => {
    const { t } = useTranslation();
    const userState = useUserState();

    return (
        <ScrollView style={styles.outerScrollview} contentContainerStyle={styles.innerScrollview} showsVerticalScrollIndicator={false}>
            <Show when={userState == USER_STATE.CAPTURED}>
                <Text style={styles.title}>{t("end.title_captured")}</Text>
            </Show>
            <Show when={userState == USER_STATE.FINISHED}>
                <Text style={styles.title}>{t("end.title_win")}</Text>
            </Show>
            <Text style={styles.subtitle}>{t("end.paragraph")}</Text>
            <TeamStats/>
        </ScrollView>
    );
};

export default End;

const styles = StyleSheet.create({
    outerScrollview: {
        flex: 1
    },
    innerScrollview: {
        padding: 20,
        gap: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center"
    },
    subtitle: {
        fontSize: 15,
    }
});
