import useAdmin from "@/hook/useAdmin";
import { TextArea } from "../util/textInput";
import { GreenButton } from "../util/button";
import { useEffect, useState } from "react";

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
        <div className='w-full h-full gap-1 bg-white p-10 flex flex-col text-center shadow-2xl overflow-y-scroll'>
            <h2 className="text-2xl">Other settings</h2>
            <div>
                <p>Waiting message</p>
                <TextArea value={waitingMessage} onChange={(e) => setWaitingMessage(e.target.value)} />
            </div>
            <div>
                <p>Captured message</p>
                <TextArea value={capturedMessage} onChange={(e) => setCapturedMessage(e.target.value)} />
            </div>
            <div>
                <p>Game finished message (winner)</p>
                <TextArea value={winnerEndMessage} onChange={(e) => setWinnerEndMessage(e.target.value)} />
            </div>
            <div>
                <p>Game finished message (loser)</p>
                <TextArea value={loserEndMessage} onChange={(e) => setLoserEndMessage(e.target.value)} />
            </div>
            <GreenButton onClick={applySettings}>Apply</GreenButton>
        </div>
    )
}
