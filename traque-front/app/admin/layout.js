import { AdminConnexionProvider } from "@/context/adminConnexionContext";
import { AdminProvider } from "@/context/adminContext";
import Link from "next/link";

export default function AdminLayout({ children }) {
    return (
        <AdminConnexionProvider>
            <AdminProvider>
                <div className='h-full flex flex-col'>
                    <div className="text-xl max-h-15 bg-gray-800 text-white  flex items-center justify-left">
                        <ul className='flex' >
                            <Link href="/admin"><li className="p-5 bg-gray-800 hover:bg-gray-600 transition-all cursor-pointer h-full">Admin</li></Link>
                            <Link href="/admin/teams"><li className="p-5 bg-gray-800 hover:bg-gray-600 transition-all cursor-pointer h-full">Teams</li></Link>
                            <Link href="/admin/parameters"><li className="p-5 bg-gray-800 hover:bg-gray-600 transition-all cursor-pointer h-full">Parameters</li></Link>
                        </ul> 
                    </div>
                    <div className="h-full overflow-y-scroll">
                        {children}
                    </div>
                </div>
            </AdminProvider>
        </AdminConnexionProvider>
    )
}