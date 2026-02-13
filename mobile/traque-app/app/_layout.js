import { Slot } from 'expo-router';
import SocketProvider from "../context/socketContext";
import { TeamConnexionProvider } from "../context/teamConnexionContext";
import { TeamProvider } from "../context/teamContext";

export default function Layout() {
    return (
        <SocketProvider>
            <TeamConnexionProvider>
                <TeamProvider>
                    <Slot/>
                </TeamProvider>
            </TeamConnexionProvider>
        </SocketProvider>
    );
}
