// Expo
import { Slot } from 'expo-router';
// Contexts
import { TeamConnexionProvider } from "../src/context/teamConnexionContext";
import { TeamProvider } from "../src/context/teamContext";

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
