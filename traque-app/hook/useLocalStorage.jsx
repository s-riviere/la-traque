import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from "react";

export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(initialValue);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const item = await AsyncStorage.getItem(key);
                setStoredValue(item ? JSON.parse(item) : initialValue);
            } catch (error) {
                console.log(error);
            }
            setLoading(false);
        }
        fetchData();
    }, []);

    const setValue = async value => {
        try {
            setLoading(true);
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
            setLoading(false);
        } catch (error) {
            console.log(error);
        }
    }

    return [storedValue, setValue, loading];
}