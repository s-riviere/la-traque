// React
import { useEffect, useState, useCallback } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(initialValue);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const item = await AsyncStorage.getItem(key);
                if (item !== null) setStoredValue(JSON.parse(item));
            } catch (error) {
                console.error(`Error loading key "${key}":`, error);
            }
        };

        fetchData();
    }, [key]);

    const setValue = useCallback(async (value) => {
        try {
            setStoredValue((prevValue) => {
                const valueToStore = value instanceof Function ? value(prevValue) : value;
                
                AsyncStorage.setItem(key, JSON.stringify(valueToStore)).catch(err => 
                    console.error(`Error saving key "${key}":`, err)
                );
                
                return valueToStore;
            });
        } catch (error) {
            console.error(error);
        }
    }, [key]);

    return [storedValue, setValue];
};
