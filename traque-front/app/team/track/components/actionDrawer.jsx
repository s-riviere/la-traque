import { useEffect, useState } from "react"
import { BlueButton, GreenButton } from "@/components/button";
import { TextInput } from "@/components/textInput";
import useTeamConnexion from "@/context/teamConnexionContext";
import useGame from "@/hook/useGame";
import EnemyTeamModal from "./enemyTeamModal";

export default function ActionDrawer() {
    const [visible, setVisible] = useState(false);
    const [enemyCaptureCode, setEnemyCaptureCode] = useState("");
    const { sendCurrentPosition, name, captureCode, capture, locationSendDeadline, penalties } = useGame();
    const {logout} = useTeamConnexion();   
    const [timeLeftBeforePenalty, setTimeLeftBeforePenalty] = useState(0);
    const [enemyModalVisible, setEnemyModalVisible] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            console.log(locationSendDeadline)
            const timeLeft = locationSendDeadline - Date.now();
            setTimeLeftBeforePenalty(Math.floor(timeLeft / 1000 / 60));
        }, 1000);
        return () => clearInterval(interval);
    }, [locationSendDeadline]);

    function handleCapture() {
        capture(enemyCaptureCode);
        setEnemyCaptureCode("");
    }

    return (
        <div className={"fixed w-screen bottom-0 z-10 bg-gray-100 flex justify-center rounded-t-2xl transition-all duration-200 flex flex-col " + (visible ? "h-full" : "h-20")}>
            <img src="/icons/arrow_up.png" className={"w-full object-scale-down h-ful max-h-20 transition-all cursor-pointer duration-200 " + (visible && "rotate-180")} onClick={() => setVisible(!visible)} />
            {visible && <div className="flex justify-between flex-col w-full h-full">
                <div className="flex flex-row justify-around">
                    <img src="/icons/logout.png" onClick={logout} className='p-3 mx-2 w-14 h-14 bg-red-500 rounded-lg cursor-pointer bg-red  z-20' />
                </div>
                <div className='shadow-2xl bg-white p-1 flex flex-col text-center mb-1  mx-auto w-4/5 rounded'>
                    <div>
                        <span className='text-2xl text-black'>{name}</span>
                    </div>
                    <div className='text-gray-700'>
                        <span> Capture code  </span>
                        <span className='text-lg text-black'>{String(captureCode).padStart(4,"0")}</span>
                    </div>
                    <div className='text-gray-700'>
                        <span className='text-lg text-black'>{timeLeftBeforePenalty}min</span>
                        <span> before penalty</span>
                    </div>
                    <div className='w-1/2 flex flex-row justify-center mx-auto'>
                        {Array.from({ length: penalties }).map((_, i) => <div key={i} className='min-h-5 m-2 min-w-5 bg-red-400'></div>)}
                        {Array.from({ length: 3-penalties }).map((_, i) => <div key={i} className='min-h-5 m-2 min-w-5 bg-green-400'></div>)}
                    </div>
                </div>
                <div className="h-20">
                    <BlueButton onClick={sendCurrentPosition} className="h-10">Update position</BlueButton>
                </div>
                <div className="p-5 shadow-lg bg-white">
                    <div className="text-center text-2xl">Target</div>
                    <div className="h-20 my-1">
                        <GreenButton onClick={() => setEnemyModalVisible(true)}>See target info</GreenButton>
                    </div>
                    <div className="h-20 flex flex-row">
                        <TextInput inputMode="numeric" placeholder="Enemy code" value={enemyCaptureCode} onChange={(e) => setEnemyCaptureCode(e.target.value)} />
                        <GreenButton onClick={handleCapture}>Capture target</GreenButton>
                    </div>
                </div>
                {/* <div className="h-20">
                    <RedButton onClick={sendCurrentPosition}>Signal emergency</RedButton>
                </div> */}
            </div>
            }
        <EnemyTeamModal visible={enemyModalVisible} onClose={() => setEnemyModalVisible(false)} />
        </div>
    )
}
