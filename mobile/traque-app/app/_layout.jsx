// Expo
import { Slot } from 'expo-router';
// Contexts
import { TeamConnexionProvider } from "../context/teamConnexionContext";
import { TeamProvider } from "../context/teamContext";

const Layout = () => {
    return (
        <TeamConnexionProvider>
            <TeamProvider>
                <Slot/>
            </TeamProvider>
        </TeamConnexionProvider>
    );
};

export default Layout;
