import React, { useState, useEffect } from 'react';
import { SchedulerView } from './components/SchedulerView';
import { MatcherView } from './components/MatcherView';
import { useLocalStorage } from './hooks/useLocalStorage';
import { type Therapist } from './types';
import { generateSeedData } from './services/seed';

enum View {
  Scheduler,
  Matcher,
}

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.Scheduler);
  const [therapists, setTherapists] = useLocalStorage<Therapist[]>('therapists', []);
  const [activeTherapistId, setActiveTherapistId] = useState<string | null>(null);

  useEffect(() => {
    const storedTherapists = window.localStorage.getItem('therapists');
     // Check if therapists are not set in local storage or state
    if (!storedTherapists || JSON.parse(storedTherapists).length === 0) {
      const seedData = generateSeedData();
      if(seedData.length > 0) {
        setTherapists(seedData);
        setActiveTherapistId(seedData[0].id);
      }
    }
  }, [setTherapists]); // Run only once on initial mount if therapists are not loaded

  useEffect(() => {
    const activeExists = therapists.some(t => t.id === activeTherapistId);
    if (therapists.length > 0 && !activeExists) {
      // If there's no active therapist or the active one was deleted, select the first one.
      setActiveTherapistId(therapists[0].id);
    } else if (therapists.length === 0) {
      // If there are no therapists, clear the active ID.
      setActiveTherapistId(null);
    } else if (therapists.length > 0 && activeTherapistId === null) {
        // If there are therapists but none is active
        setActiveTherapistId(therapists[0].id);
    }
  }, [therapists, activeTherapistId]);

  const activeTherapist = therapists.find(t => t.id === activeTherapistId) || null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-blue-600">
              Therapist Scheduler
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setView(View.Scheduler)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === View.Scheduler
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Schedule Manager
              </button>
              <button
                onClick={() => setView(View.Matcher)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === View.Matcher
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Find Best Fit
              </button>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto p-4 md:p-6">
        {view === View.Scheduler && (
          <SchedulerView 
            therapists={therapists} 
            setTherapists={setTherapists}
            activeTherapist={activeTherapist}
            setActiveTherapistId={setActiveTherapistId}
          />
        )}
        {view === View.Matcher && <MatcherView allTherapists={therapists} />}
      </main>
    </div>
  );
};

export default App;