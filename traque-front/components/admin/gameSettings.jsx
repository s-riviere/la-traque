import useAdmin from "@/hook/useAdmin";
import { GreenButton } from "../util/button";
import { Section } from "../util/section";
import { useEffect, useState } from "react";

function MessageInput({title, ...props}) {
    return (
        <div className="w-full flex flex-row gap-3 items-center">
            <p>{title}</p>
            <input {...props} type="text" className="w-full h-8 p-2 rounded ring-1 ring-inset ring-gray-400 placeholder:text-gray-600" />
        </div>
    );
}

export default function GameSettings() {
    const {gameSettings, changeGameSettings} = useAdmin();
    const [capturedMessage, setCapturedMessage] = useState("");
    const [winnerEndMessage, setWinnerEndMessage] = useState("");
    const [loserEndMessage, setLoserEndMessage] = useState("");
    const [waitingMessage, setWaitingMessage] = useState("");

    useEffect(() => {
        if (gameSettings) {
            setCapturedMessage(gameSettings.capturedMessage);
            setWinnerEndMessage(gameSettings.winnerEndGameMessage);
            setLoserEndMessage(gameSettings.loserEndGameMessage);
            setWaitingMessage(gameSettings.waitingMessage);
        }
    }, [gameSettings]);

    function applySettings() {
        changeGameSettings({capturedMessage: capturedMessage, winnerEndGameMessage: winnerEndMessage, loserEndGameMessage: loserEndMessage, waitingMessage: waitingMessage});
    }

    return (
        <Section title="Message">
            <div className="w-full h-full flex flex-col gap-3 items-center">
                <MessageInput title="Attente  :" value={waitingMessage} onChange={(e) => setWaitingMessage(e.target.value)}/>
                <MessageInput title="Capture :" value={capturedMessage} onChange={(e) => setCapturedMessage(e.target.value)} />
                <MessageInput title="Victoire :" value={winnerEndMessage} onChange={(e) => setWinnerEndMessage(e.target.value)} />
                <MessageInput title="Défaite  :" value={loserEndMessage} onChange={(e) => setLoserEndMessage(e.target.value)} />
                <div className='w-40 h-15'>
                    <GreenButton onClick={applySettings}>Apply</GreenButton>
                </div>
            </div>
        </Section>
    );
}
