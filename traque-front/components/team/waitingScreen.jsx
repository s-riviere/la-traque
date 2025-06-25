import useGame from "@/hook/useGame"
import { GreenButton, LogoutButton } from "../util/button";
import { useRef } from "react";
import useTeamContext from "@/context/teamContext";
import { env } from 'next-runtime-env';

export default function WaitingScreen() {
    const { name, teamId  } = useGame();
    const { gameSettings } = useTeamContext();
    const imageRef = useRef(null);
    const NEXT_PUBLIC_SOCKET_HOST = env("NEXT_PUBLIC_SOCKET_HOST");
    var protocol = "https://";
    if (NEXT_PUBLIC_SOCKET_HOST == "localhost") {
        protocol = "http://";
    }
    const SERVER_URL = protocol + NEXT_PUBLIC_SOCKET_HOST + "/back";
    console.log(SERVER_URL);

    function sendImage() {
        let data = new FormData();
        data.append('file', document.querySelector('input[type="file"]').files[0]);

        fetch(SERVER_URL + "/upload?team=" + teamId.toString() , {
            method: 'POST',
            body: data
        }).then((response) => {
            console.log(response);
            refreshImage();
        });
    }

    function refreshImage() {
        imageRef.current.src = SERVER_URL + "/photo/my?team=" + teamId.toString() + "&t=" + new Date().getTime();
    }


    return (
        <div className='h-full flex flex-col items-center justify-center'>
            <LogoutButton />
            <div className='text-4xl mt-10 text-center'>
                Equipe : {name}
            </div>
            <div className='text-2xl text-center'>
                {gameSettings?.waitingMessage}
            </div>
            <div className='text-2xl text-center my-10'>
                <p>Uploadez une photo où tous les membres de l&apos;équipe sont visibles</p>
                <input type="file" name="file" accept="image/*" className=" my-5 block w-full text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                <div className="h-20">
                <GreenButton onClick={sendImage}>Envoyer</GreenButton>
                </div>
            </div>
            {teamId && <img ref={imageRef} src={SERVER_URL + "/photo/my?team=" + teamId.toString()} className='w-screen h-1/2 object-contain' />}
        </div>
    )
}