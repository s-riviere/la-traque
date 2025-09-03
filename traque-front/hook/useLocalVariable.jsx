import { useState, useEffect } from "react";

export default function useLocalVariable(variable, setVariable) {
    const [localVariable, setLocalVariable] = useState(variable);

    useEffect(() => {
        setLocalVariable(variable);
    }, [variable]);

    function applyLocalVariable() {
        setVariable(localVariable);
    }

    return [localVariable, setLocalVariable, applyLocalVariable];
}
