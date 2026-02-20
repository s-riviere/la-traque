// React
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
// Expo
import { launchImageLibraryAsync, requestMediaLibraryPermissionsAsync } from 'expo-image-picker';

export const usePickImage = () => {
    const { t } = useTranslation();
    const [image, setImage] = useState(null);

    const pickImage = useCallback(async () => {
        try {
            const permissionResult = await requestMediaLibraryPermissionsAsync();
          
            if (permissionResult.granted === false) {
                Alert.alert(t("error.permission.title"), t("error.permission.storage_acces"));
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
            Alert.alert(t("error.title"), t("error.image_selection"));
        }
    }, [t]);

    return { image, pickImage };
};
