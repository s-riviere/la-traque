import { Inter } from "next/font/google";
import "./globals.css";
import { PublicEnvScript } from 'next-runtime-env';
import { AuthProvider } from "@/context/authContext";
import { AdminProvider } from "@/context/adminContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/authContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "La Traque",
};

const NavigationManager = () => {
    const router = useRouter();
    const { isLoggedIn } = useAuth();

    useEffect(() => {
        router.replace(isLoggedIn ? "/admin" : "/login");
    }, [router, isLoggedIn]);

    return null;
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <PublicEnvScript />
            </head>
            <body className={inter.className + " w-screen h-screen bg-gray-200"}>
                <AuthProvider>
                    <AdminProvider>
                        {children}
                        <NavigationManager/>
                    </AdminProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
