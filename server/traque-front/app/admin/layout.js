import { AdminConnexionProvider } from "@/context/adminConnexionContext";
import { AdminProvider } from "@/context/adminContext";

export default function AdminLayout({ children }) {
    return (
        <AdminConnexionProvider>
            <AdminProvider>
                {children}
            </AdminProvider>
        </AdminConnexionProvider>
    );
}
