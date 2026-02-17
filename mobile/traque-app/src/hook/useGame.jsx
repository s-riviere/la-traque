// React
import { useCallback } from "react";
// Services
import { emitSendPosition, emitCapture } from "../services/socketEmitter";

export const useGame = () => {
    
    const sendCurrentPosition = useCallback(() => {
        emitSendPosition();
    }, []);

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
    }, []);

    return { sendCurrentPosition, capture };
};
