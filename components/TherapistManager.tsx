import React, { useState } from 'react';
import { type Therapist } from '../types';
import { UserPlusIcon, TrashIcon } from './icons';

interface TherapistManagerProps {
  therapists: Therapist[];
  setTherapists: React.Dispatch<React.SetStateAction<Therapist[]>>;
  activeTherapistId: string | null;
  setActiveTherapistId: (id: string | null) => void;
}

export const TherapistManager: React.FC<TherapistManagerProps> = ({
  therapists,
  setTherapists,
  activeTherapistId,
  setActiveTherapistId,
}) => {
  const [newTherapistName, setNewTherapistName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddTherapist = () => {
    if (newTherapistName.trim()) {
      const newTherapist: Therapist = {
        id: `therapist_${Date.now()}`,
        name: newTherapistName.trim(),
        cases: [],
      };
      const updatedTherapists = [...therapists, newTherapist].sort((a,b) => a.name.localeCompare(b.name));
      setTherapists(updatedTherapists);
      setActiveTherapistId(newTherapist.id);
      setNewTherapistName('');
    }
  };
  
  const handleDeleteTherapist = (idToDelete: string) => {
    const updatedTherapists = therapists.filter(t => t.id !== idToDelete);
    setTherapists(updatedTherapists);
    if(activeTherapistId === idToDelete){
      setActiveTherapistId(updatedTherapists.length > 0 ? updatedTherapists[0].id : null);
    }
  };

  const filteredTherapists = therapists
    .filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a,b) => a.name.localeCompare(b.name));

  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-gray-700">Therapists</h3>
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          value={newTherapistName}
          onChange={(e) => setNewTherapistName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTherapist()}
          placeholder="New therapist name..."
          className="flex-grow border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
        />
        <button
          onClick={handleAddTherapist}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition-colors"
          aria-label="Add Therapist"
        >
         <UserPlusIcon className="w-5 h-5"/>
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search therapists..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
        />
      </div>

      <ul className="space-y-2 max-h-96 overflow-y-auto">
        {filteredTherapists.map(therapist => (
          <li
            key={therapist.id}
            onClick={() => setActiveTherapistId(therapist.id)}
            className={`flex justify-between items-center p-3 rounded-md cursor-pointer transition-all ${
              activeTherapistId === therapist.id
                ? 'bg-blue-100 border-l-4 border-blue-500 shadow-sm'
                : 'hover:bg-gray-100'
            }`}
          >
            <span className={`font-medium ${activeTherapistId === therapist.id ? 'text-blue-700' : 'text-gray-800'}`}>{therapist.name}</span>
             <button 
                onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTherapist(therapist.id);
                }}
                className="text-gray-400 hover:text-red-500"
                aria-label={`Delete ${therapist.name}`}
            >
                <TrashIcon className="w-4 h-4"/>
            </button>
          </li>
        ))}
         {filteredTherapists.length === 0 && (
            <p className="text-center text-gray-500 p-4">No therapists found.</p>
        )}
      </ul>
    </div>
  );
};