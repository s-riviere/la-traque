import { useEffect } from 'react';
import DeviceInfo from 'react-native-device-info';
import { useSocket } from "../context/socketContext";
import { useTeamConnexion } from "../context/teamConnexionContext";

export default function useSendDeviceInfo() {
    const batteryUpdateTimeout = 5*60*1000;
    const { teamSocket } = useSocket();
    const {loggedIn} = useTeamConnexion();

    useEffect(() => {
        if (!loggedIn) return;

        const sendInfo = async () => {
            const brand = DeviceInfo.getBrand();
            const model = DeviceInfo.getModel();
            const name = await DeviceInfo.getDeviceName();
            teamSocket.emit('deviceInfo', {model: brand + " " + model, name: name});
        };

        const sendBattery = async () => {
            const level = await DeviceInfo.getBatteryLevel();
            teamSocket.emit('batteryUpdate', Math.round(level * 100));
        };

        sendInfo();
        sendBattery();

        const batteryCheckInterval = setInterval(() => sendBattery(), batteryUpdateTimeout);

        return () => {clearInterval(batteryCheckInterval)};
    }, [loggedIn]);

    return null;
}
