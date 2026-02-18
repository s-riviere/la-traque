// Constants
import { SERVER_URL } from "../../constants";

export const uploadTeamImage = async (id, imageUri) => {
    if (!imageUri || !id) return;

    const data = new FormData();
    data.append('file', {
        uri: imageUri,
        name: 'photo.jpg',
        type: 'image/jpeg',
    });

    try {
        const response = await fetch(`${SERVER_URL}/upload?team=${id}`, {
            method: 'POST',
            body: data,
        });
        
        if (!response.ok) throw new Error("Échec de l'upload");
        return await response.blob();
    } catch (error) {
        console.error("Erreur uploadImage :", error);
        throw error;
    }
};

export const enemyImage = (id) => {
    if (!id) return require('../assets/images/missing_image.jpg');
    
    return {uri: `${SERVER_URL}/photo/enemy?team=${id}`};
};
