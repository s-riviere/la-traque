import useTeamConnexion from "@/context/teamConnexionContext";
import useGame from "@/hook/useGame";

export default function PlacementOverlay() {
    const { name, ready } = useGame();
    const {logout} = useTeamConnexion();
    return (
        <>
            <img src="/icons/logout.png" onClick={logout} className='w-12 h-12 bg-red-500 p-2 top-1 right-1 rounded-lg cursor-pointer bg-red fixed z-20' />
            <div className='fixed top-0 p-3 w-full bg-gray-300 shadow-xl rounded-b-xl flex flex-col z-10 justify-center items-center'>
                <div className='text-2xl my-3'>Placement</div>
                <div className='text-md'>{name}</div>
                {!ready && <div className='text-lg font-semibold text-red-700'>Positionez vous dans le cercle</div>}
                {ready && <div className='text-lg font-semibold text-green-700 text-center'>Restez dans le cercle en attendant que la partie commence</div>}

            </div>
        </>
    )
}