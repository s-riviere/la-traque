"use client";
import { useAdminConnexion } from '@/context/adminConnexionContext';
import LoginForm from './components/loginForm';

export default function AdminLoginPage() {
    const {login, useProtect} = useAdminConnexion();

    useProtect();

    return (
        <LoginForm title="Admin login" placeholder="Admin password" buttonText={"Login"} onSubmit={login} />
    );
}
