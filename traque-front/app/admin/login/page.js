"use client";
import { useState } from "react";
import { useAdminConnexion } from '@/context/adminConnexionContext';

export default function AdminLoginPage() {
    const {login, useProtect} = useAdminConnexion();
    const [value, setValue] = useState("");

    useProtect();
    
    function handleSubmit(e) {
        e.preventDefault();
        setValue("");
        login(value);
    }

    return (
        <div className="w-full h-full flex items-center justify-center">
            <form className="flex flex-col items-center gap-3 bg-white p-8 rounded-lg ring-1 ring-black" onSubmit={handleSubmit}>
                <h1 className="text-2xl font-bold text-center text-gray-700">Admin login</h1>
                <input name="team-id" className="w-60 h-12 text-center rounded ring-1 ring-inset ring-black placeholder:text-gray-400" placeholder="Admin password" value={value} onChange={(e) => setValue(e.target.value)}/>
                <button className=" w-40 h-12 bg-blue-600 hover:bg-blue-500 text-l text-white rounded ease-out duration-200" type="submit">Login</button>
            </form>
        </div>
    );
}
