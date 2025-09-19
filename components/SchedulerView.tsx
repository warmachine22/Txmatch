
import React, { useState, useMemo } from 'react';
import { type Therapist, type Case } from '../types';
import { WeeklyCalendar } from './WeeklyCalendar';
import { TherapistManager } from './TherapistManager';
import { CaseModal } from './CaseModal';
import { CASE_COLORS, CASE_BORDER_COLORS } from '../constants';

interface SchedulerViewProps {
  therapists: Therapist[];
  setTherapists: React.Dispatch<React.SetStateAction<Therapist[]>>;
  activeTherapist: Therapist | null;
  setActiveTherapistId: (id: string | null) => void;
}

export const SchedulerView: React.FC<SchedulerViewProps> = ({ therapists, setTherapists, activeTherapist, setActiveTherapistId }) => {
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  
  const totalHours = useMemo(() => {
    if (!activeTherapist) return 0;
    return activeTherapist.cases.reduce((sum, currentCase) => sum + currentCase.schedule.length * 0.5, 0);
  }, [activeTherapist]);

  const addCaseToTherapist = (caseName: string, caseAddress: string) => {
    if (!activeTherapist) return;
    const nextColorIndex = activeTherapist.cases.length % CASE_COLORS.length;
    const newCase: Case = {
      id: `case_${Date.now()}`,
      name: caseName,
      address: caseAddress,
      color: CASE_COLORS[nextColorIndex],
      schedule: [],
    };
    const updatedTherapists = therapists.map(t =>
      t.id === activeTherapist.id
        ? { ...t, cases: [...t.cases, newCase] }
        : t
    );
    setTherapists(updatedTherapists);
  };
  
  const deleteCase = (caseId: string) => {
    if(!activeTherapist) return;
    const updatedTherapists = therapists.map(t => {
      if(t.id === activeTherapist.id) {
        return {...t, cases: t.cases.filter(c => c.id !== caseId)};
      }
      return t;
    });
    setTherapists(updatedTherapists);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-sm">
        <TherapistManager
          therapists={therapists}
          setTherapists={setTherapists}
          activeTherapistId={activeTherapist?.id || null}
          setActiveTherapistId={setActiveTherapistId}
        />
      </div>

      <div className="lg:col-span-3 bg-white p-4 rounded-lg shadow-sm">
        {activeTherapist ? (
          <div>
            <div className="flex flex-wrap items-center justify-between mb-4 border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{activeTherapist.name}'s Schedule</h2>
                <p className="text-gray-500">Total hours scheduled: <span className="font-semibold">{totalHours}</span></p>
              </div>
              <button
                onClick={() => setIsCaseModalOpen(true)}
                className="mt-2 sm:mt-0 flex items-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Add Case
              </button>
            </div>
            
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Cases</h3>
              <div className="flex flex-wrap gap-2">
                {activeTherapist.cases.length > 0 ? activeTherapist.cases.map((c, index) => (
                  <div key={c.id} className={`flex items-center text-sm font-medium px-3 py-1 rounded-full text-gray-800 ${c.color} border-2 ${CASE_BORDER_COLORS[index % CASE_BORDER_COLORS.length]}`}>
                    {c.name}
                    <span className="ml-2 text-gray-600 text-xs">({(c.schedule.length * 0.5)} hrs)</span>
                  </div>
                )) : <p className="text-gray-500 italic">No cases added yet.</p>}
              </div>
            </div>

            <WeeklyCalendar 
              therapists={therapists}
              setTherapists={setTherapists}
              activeTherapist={activeTherapist}
              onDeleteCase={deleteCase}
            />
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-xl text-gray-600">No Therapist Selected</h2>
            <p className="text-gray-400 mt-2">Please add or select a therapist to view their schedule.</p>
          </div>
        )}
      </div>
      
      <CaseModal
        isOpen={isCaseModalOpen}
        onClose={() => setIsCaseModalOpen(false)}
        onAddCase={addCaseToTherapist}
      />
    </div>
  );
};
