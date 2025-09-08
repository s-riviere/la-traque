import { Inter } from "next/font/google";
import "./globals.css";
import { PublicEnvScript } from 'next-runtime-env';
import SocketProvider from "@/context/socketContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "La Traque",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <PublicEnvScript />
            </head>
            <body className={inter.className + " w-screen h-screen bg-gray-200"}>
                <SocketProvider>
                    {children}
                </SocketProvider>
            </body>
        </html>
    );
}
