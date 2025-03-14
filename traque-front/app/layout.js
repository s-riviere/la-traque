import { Inter } from "next/font/google";
import "./globals.css";
import SocketProvider from "@/context/socketContext";

import { PublicEnvScript } from 'next-runtime-env';

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
      <SocketProvider>
        <body className={inter.className + " h-screen"}>{children}</body>
      </SocketProvider>
    </html>
  );
}
