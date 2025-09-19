import React, { useState, useMemo } from 'react';
import { type Therapist, type TimeSlot, type NewCaseInfo, type MatchResult } from '../types';
import { getCoordinates, calculateDistance } from '../services/geoService';
import { MatcherResults } from './MatcherResults';
import { DAYS_OF_WEEK, HOURS_OF_DAY, TIME_SLOTS_PER_HOUR } from '../constants';
import { PlusIcon } from './icons';

interface MatcherViewProps {
  allTherapists: Therapist[];
}

const formatTime = (hour: number) => {
    const h = Math.floor(hour);
    const m = (hour % 1) * 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    const displayMinute = m < 10 ? `0${m}` : m;
    return `${displayHour}:${displayMinute} ${ampm}`;
};

const AvailabilityPicker: React.FC<{availability: TimeSlot[], setAvailability: (slots: TimeSlot[]) => void}> = ({availability, setAvailability}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState<TimeSlot | null>(null);
    const [dragEnd, setDragEnd] = useState<TimeSlot | null>(null);
    const availabilitySet = useMemo(() => new Set(availability.map(s => `${s.day}-${s.time}`)), [availability]);

    const handleMouseDown = (day: number, time: number) => {
        setIsDragging(true);
        const slot = { day, time };
        setDragStart(slot);
        setDragEnd(slot);
    };

    const handleMouseEnter = (day: number, time: number) => {
        if (isDragging) setDragEnd({ day, time });
    };

    const handleMouseUp = () => {
        if (!isDragging || !dragStart || !dragEnd) return;
        
        const minDay = Math.min(dragStart.day, dragEnd.day);
        const maxDay = Math.max(dragStart.day, dragEnd.day);
        const minTime = Math.min(dragStart.time, dragEnd.time);
        const maxTime = Math.max(dragStart.time, dragEnd.time);

        const updatedAvailability = new Map(availability.map(s => [`${s.day}-${s.time}`, s]));
        let isAdding = false;
        if(minDay !== null && minTime !== null && !availabilitySet.has(`${minDay}-${minTime}`)) {
            isAdding = true;
        }

        for (let day = minDay; day <= maxDay; day++) {
            for (let time = minTime; time <= maxTime; time += 1 / TIME_SLOTS_PER_HOUR) {
                const key = `${day}-${time}`;
                if (isAdding) {
                    updatedAvailability.set(key, { day, time });
                } else {
                    updatedAvailability.delete(key);
                }
            }
        }
        setAvailability(Array.from(updatedAvailability.values()));
        setIsDragging(false);
        setDragStart(null);
        setDragEnd(null);
    };
    
    const selectionArea = useMemo(() => {
        if (!isDragging || !dragStart || !dragEnd) return null;
        return {
            minDay: Math.min(dragStart.day, dragEnd.day),
            maxDay: Math.max(dragStart.day, dragEnd.day),
            minTime: Math.min(dragStart.time, dragEnd.time),
            maxTime: Math.max(dragStart.time, dragEnd.time),
        };
    }, [isDragging, dragStart, dragEnd]);
    
    return (
        <div onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-px bg-gray-200 border-b border-gray-200">
                <div className="bg-white p-2"></div>
                {DAYS_OF_WEEK.map(day => <div key={day} className="text-center font-semibold p-2 bg-gray-100 text-sm">{day}</div>)}

                {HOURS_OF_DAY.map(hour => (
                    <React.Fragment key={hour}>
                        <div className={`row-span-${TIME_SLOTS_PER_HOUR} bg-gray-100 text-right p-1 text-xs font-semibold text-gray-500 flex items-center justify-end`}>
                            {formatTime(hour)}
                        </div>
                        {DAYS_OF_WEEK.map((_, dayIndex) => Array.from({ length: TIME_SLOTS_PER_HOUR }, (_, i) => hour + i / TIME_SLOTS_PER_HOUR).map(time => {
                            const isAvailable = availabilitySet.has(`${dayIndex}-${time}`);
                            const isSelected = selectionArea && dayIndex >= selectionArea.minDay && dayIndex <= selectionArea.maxDay && time >= selectionArea.minTime && time <= selectionArea.maxTime;
                            let slotClass = "bg-gray-50 hover:bg-green-100 cursor-pointer";
                            if(isAvailable) slotClass = "bg-green-400 hover:bg-green-500 cursor-pointer";
                            if(isSelected) slotClass = "bg-blue-300 opacity-70";
                            return <div key={`${dayIndex}-${time}`} className={`h-6 ${slotClass}`} onMouseDown={() => handleMouseDown(dayIndex, time)} onMouseEnter={() => handleMouseEnter(dayIndex, time)}></div>;
                        }))}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};


export const MatcherView: React.FC<MatcherViewProps> = ({ allTherapists }) => {
    const [newCase, setNewCase] = useState<NewCaseInfo>({ name: '', address: '', requiredHours: 10, availability: [] });
    const [distanceRadius, setDistanceRadius] = useState(5); // miles
    const [breakTime, setBreakTime] = useState(30); // minutes
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<MatchResult[] | null>(null);

    const handleFindMatch = async () => {
        if (!newCase.address || !newCase.requiredHours) {
            alert("Please fill in the new case details.");
            return;
        }
        setIsLoading(true);
        setResults(null);

        const newCaseCoords = await getCoordinates(newCase.address);
        if (!newCaseCoords) {
            alert("Could not find coordinates for the new case address. Please check the address.");
            setIsLoading(false);
            return;
        }

        const matchPromises = allTherapists.map(async (therapist): Promise<MatchResult> => {
            let isDistanceMatch = true;
            if (therapist.cases.length > 0 && newCaseCoords) {
                const caseCoordsPromises = therapist.cases.map(c => getCoordinates(c.address));
                const allCaseCoords = await Promise.all(caseCoordsPromises);
                for (const caseCoord of allCaseCoords) {
                    if (caseCoord && calculateDistance(newCaseCoords, caseCoord) > distanceRadius) {
                        isDistanceMatch = false;
                        break;
                    }
                }
            }

            const therapistSchedule = new Set<string>();
            const breakSlots = breakTime / (60 / TIME_SLOTS_PER_HOUR);

            therapist.cases.forEach(c => {
                c.schedule.forEach(slot => {
                    therapistSchedule.add(`${slot.day}-${slot.time}`);
                    // Add break time
                    for (let i = 1; i <= breakSlots; i++) {
                        therapistSchedule.add(`${slot.day}-${slot.time - i / TIME_SLOTS_PER_HOUR}`);
                        therapistSchedule.add(`${slot.day}-${slot.time + i / TIME_SLOTS_PER_HOUR}`);
                    }
                });
            });

            const caseAvailability = new Set(newCase.availability.map(s => `${s.day}-${s.time}`));
            let availableSlots = 0;
            caseAvailability.forEach(slotKey => {
                if (!therapistSchedule.has(slotKey)) {
                    availableSlots++;
                }
            });
            const availableHours = availableSlots / TIME_SLOTS_PER_HOUR;
            
            const totalHours = therapist.cases.reduce((sum, c) => sum + c.schedule.length / TIME_SLOTS_PER_HOUR, 0);

            return { therapist, totalHours, availableHours, isDistanceMatch };
        });

        const unfilteredResults = await Promise.all(matchPromises);
        
        const filteredAndSorted = unfilteredResults
            .filter(r => r.isDistanceMatch && r.availableHours >= newCase.requiredHours)
            .sort((a, b) => {
                if (a.totalHours !== b.totalHours) {
                    return a.totalHours - b.totalHours; // Fewer hours first
                }
                return b.availableHours - a.availableHours; // More availability second
            });

        setResults(filteredAndSorted);
        setIsLoading(false);
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Find Best Fit for New Case</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <input type="text" placeholder="Case Name/ID" value={newCase.name} onChange={e => setNewCase({...newCase, name: e.target.value})} className="border p-2 rounded-md bg-white text-gray-900 placeholder-gray-500" />
                    <input type="text" placeholder="Case Address" value={newCase.address} onChange={e => setNewCase({...newCase, address: e.target.value})} className="border p-2 rounded-md md:col-span-2 bg-white text-gray-900 placeholder-gray-500" />
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Required Hours/Week</label>
                        <input type="number" value={newCase.requiredHours} onChange={e => setNewCase({...newCase, requiredHours: parseInt(e.target.value, 10)})} className="border p-2 rounded-md w-full bg-white text-gray-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Distance Radius (miles)</label>
                        <input type="number" value={distanceRadius} onChange={e => setDistanceRadius(parseInt(e.target.value, 10))} className="border p-2 rounded-md w-full bg-white text-gray-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Break Time (minutes)</label>
                        <select value={breakTime} onChange={e => setBreakTime(parseInt(e.target.value, 10))} className="border p-2 rounded-md w-full bg-white text-gray-900">
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={45}>45 minutes</option>
                            <option value={60}>60 minutes</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Set Case Availability</h3>
                <p className="text-sm text-gray-500 mb-4">Click and drag to mark the times this case is available for therapy. Click and drag on green areas to remove availability.</p>
                <AvailabilityPicker availability={newCase.availability} setAvailability={(slots) => setNewCase({...newCase, availability: slots})} />
            </div>

            <div className="text-center">
                <button 
                    onClick={handleFindMatch} 
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors disabled:bg-blue-300"
                >
                    {isLoading ? 'Searching...' : 'Find Matching Therapists'}
                </button>
            </div>
            
            {isLoading && (
                 <div className="text-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Analyzing schedules and locations...</p>
                 </div>
            )}

            {results && <MatcherResults results={results} />}
        </div>
    );
};