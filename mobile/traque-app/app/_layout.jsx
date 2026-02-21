// React
import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
// Expo
import { Slot, useRouter, usePathname } from 'expo-router';
// Components
import { IconButton } from '@/components/common/IconButton';
// Contexts
import { AuthProvider } from "@/contexts/authContext";
import { TeamProvider } from "@/contexts/teamContext";
// Hook
import { useUserState } from '@/hooks/useUserState';
// Services
import { startLocationTracking , stopLocationTracking } from '@/services/tasks/backgroundLocation';
// Constants
import { USER_STATE } from '@/constants';
// Traduction
import '@/i18n/config';

const NavigationManager = () => {
    const router = useRouter();
    const pathname = usePathname();
    const userState = useUserState();
    
    // Location tracking
    useEffect(() => {
        const trackingStates = [
            USER_STATE.WAITING, 
            USER_STATE.PLACEMENT, 
            USER_STATE.PLAYING, 
            USER_STATE.CAPTURED, 
            USER_STATE.FINISHED
        ];

        if (trackingStates.includes(userState)) {
            startLocationTracking();
        } else {
            stopLocationTracking();
        }
    }, [userState]);

    // Routing
    useEffect(() => {
        let targetRoute;

        switch (userState) {
            case USER_STATE.LOADING:
                return;
            case USER_STATE.NO_LOCATION:
                targetRoute = "/location-permission";
                break;
            case USER_STATE.OFFLINE:
                targetRoute = "/login";
                break;
            case USER_STATE.WAITING:
                targetRoute = "/wait";
                break;
            case USER_STATE.PLACEMENT:
            case USER_STATE.PLAYING:
                targetRoute = "/play";
                break;
            case USER_STATE.CAPTURED:
            case USER_STATE.FINISHED:
                targetRoute = "/end";
                break;
            default:
                targetRoute = "/";
                break;
        }

        if (pathname !== targetRoute) {
            router.replace(targetRoute);
        }
    }, [router, pathname, userState]);

    return null;
};

const Language = () => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr');
    };

    return (
        <View style={styles.languageButton}>
            <IconButton source={require('@/assets/images/language.png')} onPress={toggleLanguage} />
        </View>
    );
};

const RootLayout = () => {
    return (
        <AuthProvider>
            <TeamProvider>
                <Slot/>
                <NavigationManager/>
                <Language/>
            </TeamProvider>
        </AuthProvider>
    );
};

export default RootLayout;

const styles = StyleSheet.create({
    languageButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: "rgb(126, 182, 199)",
        borderBottomLeftRadius: 20,
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
