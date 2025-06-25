"use client";
import { redirect, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function usePasswordProtect(loginPath, redirectPath, loading, loggedIn) {
    const path = usePathname();
    
    useEffect(() => {
        if (!loggedIn && !loading && path !== loginPath) {
            redirect(loginPath);
        }
        if(loggedIn && !loading && path === loginPath) {
            redirect(redirectPath)
        }
    }, [loggedIn, loading, path]);
}
