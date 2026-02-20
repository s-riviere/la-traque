// React
import { useEffect } from 'react';
// Expo
import { Slot, useRouter, usePathname } from 'expo-router';
// Contexts
import { AuthProvider } from "@/contexts/authContext";
import { TeamProvider } from "@/contexts/teamContext";
// Services
import { startLocationTracking , stopLocationTracking } from '@/services/tasks/backgroundLocation';
// Constants
import { USER_STATE } from '@/constants';
// Traduction
import '@/i18n/config';
import { useUserState } from '@/hooks/useUserState';

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

const RootLayout = () => {
    return (
        <AuthProvider>
            <TeamProvider>
                <Slot/>
                <NavigationManager/>
            </TeamProvider>
        </AuthProvider>
    );
};

export default RootLayout;
