"use client";
import LoginForm from '@/components/team/loginForm'
import { useAdminConnexion } from '@/context/adminConnexionContext';
import React from 'react'

export default function AdminLoginPage() {
    const {login, useProtect} = useAdminConnexion();

    useProtect();

    return (
        <LoginForm title="Admin login" placeholder="Admin password" buttonText={"Login"} onSubmit={login} />
    );
}
