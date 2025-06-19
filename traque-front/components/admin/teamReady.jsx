import useAdmin from "@/hook/useAdmin"

export function TeamReady() {
    const {teams} = useAdmin();
    return <div className='w-full h-full gap-1 bg-white p-10 flex flex-col text-center shadow-2xl overflow-y-scroll'>
        <h2 className="text-2xl">Teams ready status</h2>
        {teams.map((team) => team.ready ? (
             <div key={team.id} className="p-2 text-white bg-green-500 shadow-md text-xl rounded flex flex-row">
                <div>{team.name} : Ready</div>
            </div>) : (
            <div key={team.id} className="p-2 text-white bg-red-500 shadow-md text-xl rounded flex flex-row">
                <div>{team.name} : Not ready</div>
            </div>
            ))}
    </div>
}