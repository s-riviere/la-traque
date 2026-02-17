// React
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
// Expo
import { launchImageLibraryAsync, requestMediaLibraryPermissionsAsync } from 'expo-image-picker';

export const usePickImage = () => {
    const [image, setImage] = useState(null);

    const pickImage = useCallback(async () => {
        try {
            const permissionResult = await requestMediaLibraryPermissionsAsync();
          
            if (permissionResult.granted === false) {
                Alert.alert("Permission refusée", "Activez l'accès au stockage ou à la gallerie dans les paramètres.");
                return;
            }
            let result = await launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsMultipleSelection: false,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled && result) {
                setImage(result.assets[0]);
            }
            else {
                console.log('Image picker cancelled.');
            }
        } catch (error) {
            console.error('Error picking image;', error);
            Alert.alert('Erreur', "Une erreur est survenue lors de la sélection d'une image.");
        }
    }, []);

    return {image, pickImage};
};
