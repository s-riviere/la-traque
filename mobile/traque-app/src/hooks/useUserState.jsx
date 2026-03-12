// React
import { useState, useEffect, useMemo } from "react";
// Contexts
import { useAuth } from "@/contexts/authContext";
import { useTeam } from "@/contexts/teamContext";
// Constants
import { GAME_STATE, USER_STATE } from '@/config';
import { getLocationAuthorization } from '@/services/tasks/backgroundLocation';

export const useUserState = () => {
    const { isLoggedIn } = useAuth();
    const { teamStateData, gameState } = useTeam();
    const { isEliminated } = teamStateData;
    const [isLocationAuthorized, setIsLocationAuthorized] = useState(null);

    useEffect(() => {
        const checkLocationAuth = async () => {
            const result = await getLocationAuthorization();
            setIsLocationAuthorized(result);
        };

        checkLocationAuth();
    }, []);

    return useMemo(() => {
        if (isLocationAuthorized == null) return USER_STATE.LOADING;
        if (!isLocationAuthorized) return USER_STATE.NO_LOCATION;
        if (!isLoggedIn) return USER_STATE.OFFLINE;

        switch (gameState) {
            case GAME_STATE.SETUP:
                return USER_STATE.WAITING;
            case GAME_STATE.PLACEMENT:
                return USER_STATE.PLACEMENT;
            case GAME_STATE.PLAYING:
                return isEliminated ? USER_STATE.CAPTURED : USER_STATE.PLAYING;
            case GAME_STATE.FINISHED:
                return isEliminated ? USER_STATE.CAPTURED : USER_STATE.FINISHED;
            default:
                return USER_STATE.WAITING;
        }
    }, [isLoggedIn, gameState, isEliminated, isLocationAuthorized]);
};
