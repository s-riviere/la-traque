// Expo
import { Slot } from 'expo-router';
// Contexts
import { AuthProvider } from "../src/contexts/authContext";
import { TeamProvider } from "../src/contexts/teamContext";

const Layout = () => {
    return (
        <AuthProvider>
            <TeamProvider>
                <Slot/>
            </TeamProvider>
        </AuthProvider>
    );
};

export default Layout;
