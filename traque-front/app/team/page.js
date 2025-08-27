"use client"
import { useTeamConnexion } from "@/context/teamConnexionContext";
import LoginForm from "./components/loginForm";

export default function Home() {
  const { login,useProtect  } = useTeamConnexion();
  useProtect();
  return (
    <div>
      <LoginForm title={"Team login"} placeholder={"team ID"} buttonText={"Login"} onSubmit={(value) => login(parseInt(value))}/>
    </div>
  );
}
