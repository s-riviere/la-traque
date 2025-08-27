import { AdminConnexionProvider } from "@/context/adminConnexionContext";
import { AdminProvider } from "@/context/adminContext";

export default function AdminLayout({ children }) {
    return (
        <AdminConnexionProvider>
            <AdminProvider>
                <div className="h-full overflow-y-scroll">
                    {children}
                </div>
            </AdminProvider>
        </AdminConnexionProvider>
    );
}
