// Expo
import { Slot } from 'expo-router';
// Contexts
import { SocketProvider } from "../context/socketContext";
import { TeamConnexionProvider } from "../context/teamConnexionContext";
import { TeamProvider } from "../context/teamContext";

const Layout = () => {
    return (
        <SocketProvider>
            <TeamConnexionProvider>
                <TeamProvider>
                    <Slot/>
                </TeamProvider>
            </TeamConnexionProvider>
        </SocketProvider>
    );
};

export default Layout;
