"use client";
import TeamAddForm from '@/components/admin/teamAdd';
import TeamEdit from '@/components/admin/teamEdit';
import TeamList from '@/components/admin/teamList';
import { useAdminConnexion } from '@/context/adminConnexionContext';
import useAdmin from '@/hook/useAdmin';
import React, { useState } from 'react'

export default function TeamAdminPage() {
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const { addTeam } = useAdmin();
  const { useProtect }  = useAdminConnexion();

  useProtect();

  return (
      <div className='h-full bg-gray-200 p-10 flex flex-row justify-between'> 
        <div className='w-1/3 p-5 bg-white mx-5 h-full p-4 shadow-2xl rounded overflow-y-scroll max-h-full'>
          <h2 className='text-2xl text-center'>Team list</h2>
          <TeamAddForm onAddTeam={addTeam}/>
          <TeamList selectedTeamId={selectedTeamId} onSelected={setSelectedTeamId}/>
        </div>
        <div className='w-2/3 p-5 mx-5 bg-white h-full p-4 shadow-2xl rounded'>
          {selectedTeamId && <TeamEdit selectedTeamId={selectedTeamId} setSelectedTeamId={setSelectedTeamId}/>}
        </div>
      </div>
  )
}
