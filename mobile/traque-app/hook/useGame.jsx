// React
import { useCallback } from "react";
// Hook
import { useSocketCommands } from "./useSocketCommands";

export const useGame = () => {
    const { emitSendPosition, emitCapture } = useSocketCommands();
    
    const sendCurrentPosition = useCallback(() => {
        emitSendPosition();
    }, [emitSendPosition]);

    const capture = useCallback((captureCode) => {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                console.warn("Server timeout: capture", captureCode);
                reject(new Error("Timeout"));
            }, 3000);
        
            emitCapture(captureCode, (response) => {
                clearTimeout(timeout);
                resolve(response);
            });
        });
    }, [emitCapture]);

    return { sendCurrentPosition, capture };
};
