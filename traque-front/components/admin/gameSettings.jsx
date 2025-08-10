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
        <div className='w-full h-full gap-5 bg-white p-10 flex flex-col text-center shadow-2xl overflow-y-scroll'>
            <h2 className="text-2xl">Messages</h2>
            <div className='w-full gap-1 flex flex-col text-center'>
                <p>Game setup</p>
                <TextArea style={{height: 60}} value={waitingMessage} onChange={(e) => setWaitingMessage(e.target.value)} />
            </div>
            <div className='w-full gap-1 flex flex-col text-center'>
                <p>Team captured</p>
                <TextArea style={{height: 60}} value={capturedMessage} onChange={(e) => setCapturedMessage(e.target.value)} />
            </div>
            <div className='w-full gap-1 flex flex-col text-center'>
                <p>Game finished (winner)</p>
                <TextArea style={{height: 60}} value={winnerEndMessage} onChange={(e) => setWinnerEndMessage(e.target.value)} />
            </div>
            <div className='w-full gap-1 flex flex-col text-center'>
                <p>Game finished (loser)</p>
                <TextArea style={{height: 60}} value={loserEndMessage} onChange={(e) => setLoserEndMessage(e.target.value)} />
            </div>
            <div>
                <GreenButton onClick={applySettings}>Apply</GreenButton>
            </div>
        </div>
    )
}
