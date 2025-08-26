import { useState } from 'react'

export default function TeamAddForm({onAddTeam}) {
    const [teamName, setTeamName] = useState('');
    
    function handleSubmit(e) {
        e.preventDefault();
        if (teamName !== "") {
            onAddTeam(teamName);
            setTeamName("")
        }
    }
    
    return (
        <form className='flex flex-row m-y-5 mb-3' onSubmit={handleSubmit}>
            <div className='w-4/5'>
                <input name="teamName" label='Team name' value={teamName} onChange={(e) => setTeamName(e.target.value)} type="text" className="block w-full h-full p-4 text-center ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div className='w-1/5'>
                <button type="submit" className="w-5 w-full h-full bg-custom-light-blue hover:bg-blue-500 transition text-3xl font-bold">+</button>
            </div>
        </form>
    );
}
