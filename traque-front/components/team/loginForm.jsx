import { useState } from "react";
import { BlueButton } from "../util/button";
import { TextInput } from "../util/textInput";

export default function LoginForm({ onSubmit, title, placeholder, buttonText}) {
    const [value, setValue] = useState("");
    function handleSubmit(e) {
        e.preventDefault();
        setValue("");
        onSubmit(value);
    }
    return (
        <form className="bg-white shadow-md max-w mx-auto p-5 mx-10 flex flex-col space-y-4" onSubmit={handleSubmit}>
            <h1 className="text-2xl font-bold text-center text-gray-700">{title}</h1>
            <TextInput inputMode="numeric" placeholder={placeholder} value={value} onChange={(e) => setValue(e.target.value)} name="team-id"/>
            <BlueButton type="submit">{buttonText}</BlueButton>
        </form>
    )
}
