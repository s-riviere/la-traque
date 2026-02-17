// Rect
import { useCallback, useMemo } from "react";
// Contexts
import { useTeamConnexion } from "../context/teamConnexionContext";
import { useTeamContext } from '../context/teamContext';
// Util
import { SERVER_URL } from "../util/constants";

export const useImageApi = () => {
    const { teamId } = useTeamConnexion();
    const { teamInfos } = useTeamContext();
    const { enemyName } = teamInfos;

    const uploadTeamImage = useCallback(async (imageUri) => {
        if (!imageUri || !teamId) return;

        const data = new FormData();
        data.append('file', {
            uri: imageUri,
            name: 'photo.jpg',
            type: 'image/jpeg',
        });

        try {
            const response = await fetch(`${SERVER_URL}/upload?team=${teamId}`, {
                method: 'POST',
                body: data,
            });
            
            if (!response.ok) throw new Error("Échec de l'upload");
            return await response.blob();
        } catch (error) {
            console.error("Erreur uploadImage :", error);
            throw error;
        }
    }, [teamId]);

    const enemyImage = useMemo(() => {
        if (!teamId || !enemyName) return require('../assets/images/missing_image.jpg');
        
        return {uri: `${SERVER_URL}/photo/enemy?team=${teamId}`};
    }, [teamId, enemyName]);

    return { enemyImage, uploadTeamImage };
};
