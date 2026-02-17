// React
import { useEffect, useRef } from 'react';
import DeviceInfo from 'react-native-device-info';
// Context
import { useTeamConnexion } from "../context/teamConnexionContext";
// Services
import { emitBattery, emitDeviceInfo } from "../services/socketEmitter";

export const useSendDeviceInfo = () => {
    const { loggedIn } = useTeamConnexion();
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;

        if (!loggedIn) return;

        const sendInfo = async () => {
            const [brand, model, name] = await Promise.all([
                DeviceInfo.getBrand(),
                DeviceInfo.getModel(),
                DeviceInfo.getDeviceName()
            ]);
            if (!isMounted) return;
            emitDeviceInfo({model: brand + " " + model, name: name});
        };

        const sendBattery = async () => {
            const level = await DeviceInfo.getBatteryLevel();
            if (!isMounted) return;
            emitBattery(Math.round(level * 100));
        };

        sendInfo();
        sendBattery();

        const batteryCheckInterval = setInterval(() => sendBattery(), 5*60*1000); // 5 minutes

        return () => {
            isMounted.current = false;
            clearInterval(batteryCheckInterval);
        };
    }, [loggedIn]);

    return null;
};
