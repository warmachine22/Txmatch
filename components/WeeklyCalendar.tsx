import React, { useState, useMemo, useEffect } from 'react';
import { type Therapist, type TimeSlot, type Case } from '../types';
import { DAYS_OF_WEEK, HOURS_OF_DAY, TIME_SLOTS_PER_HOUR, CASE_BORDER_COLORS } from '../constants';
import { TrashIcon } from './icons';

interface WeeklyCalendarProps {
  therapists: Therapist[];
  setTherapists: React.Dispatch<React.SetStateAction<Therapist[]>>;
  activeTherapist: Therapist;
  onDeleteCase: (caseId: string) => void;
}

const formatTime = (hour: number) => {
  const h = Math.floor(hour);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${displayHour} ${ampm}`;
};

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ therapists, setTherapists, activeTherapist, onDeleteCase }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<TimeSlot | null>(null);
  const [dragEnd, setDragEnd] = useState<TimeSlot | null>(null);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  
  useEffect(() => {
    // When active therapist changes, reset the active case for scheduling
    const currentCaseExists = activeTherapist.cases.some(c => c.id === activeCaseId);
    if (!currentCaseExists) {
        setActiveCaseId(activeTherapist.cases[0]?.id || null);
    }
  }, [activeTherapist, activeCaseId]);

  const scheduleMap = useMemo(() => {
    const map = new Map<string, Case>();
    activeTherapist.cases.forEach(c => {
      c.schedule.forEach(slot => {
        map.set(`${slot.day}-${slot.time}`, c);
      });
    });
    return map;
  }, [activeTherapist.cases]);

  const handleMouseDown = (day: number, time: number) => {
    const slotKey = `${day}-${time}`;
    if (scheduleMap.has(slotKey)) {
        // Prevent starting a drag on an existing event
        return;
    }
    if(!activeCaseId) {
        alert("Please add a case and select it before scheduling.");
        return;
    }
    setIsDragging(true);
    const slot = { day, time };
    setDragStart(slot);
    setDragEnd(slot);
  };

  const handleMouseEnter = (day: number, time: number) => {
    if (isDragging) {
      setDragEnd({ day, time });
    }
  };

  const handleMouseUp = () => {
    if (!isDragging || !dragStart || !dragEnd || !activeCaseId) {
      setIsDragging(false);
      return;
    }
    
    const minDay = Math.min(dragStart.day, dragEnd.day);
    const maxDay = Math.max(dragStart.day, dragEnd.day);
    const minTime = Math.min(dragStart.time, dragEnd.time);
    const maxTime = Math.max(dragStart.time, dragEnd.time);

    const newSlots: TimeSlot[] = [];
    for (let day = minDay; day <= maxDay; day++) {
      for (let hour = minTime; hour <= maxTime; hour += 1 / TIME_SLOTS_PER_HOUR) {
        const slotKey = `${day}-${hour}`;
        if (!scheduleMap.has(slotKey)) { // Don't overwrite existing slots
             newSlots.push({ day, time: hour });
        }
      }
    }

    const updatedTherapists = therapists.map(t => {
      if (t.id === activeTherapist.id) {
        const updatedCases = t.cases.map(c => {
          if (c.id === activeCaseId) {
            // Avoid duplicates
            const existingSlotKeys = new Set(c.schedule.map(s => `${s.day}-${s.time}`));
            const filteredNewSlots = newSlots.filter(s => !existingSlotKeys.has(`${s.day}-${s.time}`));
            return { ...c, schedule: [...c.schedule, ...filteredNewSlots] };
          }
          return c;
        });
        return { ...t, cases: updatedCases };
      }
      return t;
    });

    setTherapists(updatedTherapists);
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };
  
  const handleSlotClick = (day: number, time: number) => {
    const slotKey = `${day}-${time}`;
    const caseOnSlot = scheduleMap.get(slotKey);
    if(caseOnSlot){
      const confirmDelete = window.confirm(`Remove this time slot for ${caseOnSlot.name}? To remove all slots, delete the case.`);
      if(confirmDelete){
         const updatedTherapists = therapists.map(t => {
          if (t.id === activeTherapist.id) {
            const updatedCases = t.cases.map(c => {
              if (c.id === caseOnSlot.id) {
                return { ...c, schedule: c.schedule.filter(s => s.day !== day || s.time !== time) };
              }
              return c;
            });
            return { ...t, cases: updatedCases };
          }
          return t;
        });
        setTherapists(updatedTherapists);
      }
    }
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
    <div onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        <div className="mb-4">
            <h4 className="font-semibold text-md mb-2">Assign Schedule For:</h4>
            <div className="flex flex-wrap gap-2">
                {activeTherapist.cases.length > 0 ? activeTherapist.cases.map((c, index) => (
                    <button 
                        key={c.id}
                        onClick={() => setActiveCaseId(c.id)}
                        className={`flex items-center text-sm font-medium px-3 py-2 rounded-lg text-gray-800 transition-all ${c.color} border-2 ${activeCaseId === c.id ? 'ring-4 ring-offset-1 ring-blue-500' : ''} ${CASE_BORDER_COLORS[index % CASE_BORDER_COLORS.length]}`}
                    >
                        {c.name}
                        <button onClick={(e) => { e.stopPropagation(); if(window.confirm(`Are you sure you want to delete case "${c.name}"?`)) onDeleteCase(c.id); }} className="ml-2 text-gray-500 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                    </button>
                )) : (
                    <p className="text-gray-500 italic text-sm">Add a case to begin scheduling.</p>
                )}
            </div>
        </div>

      <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-px bg-gray-200 border border-gray-200 relative">
        <div className="bg-white p-2"></div>
        {DAYS_OF_WEEK.map(day => <div key={day} className="text-center font-semibold p-2 bg-gray-100 text-sm">{day}</div>)}

        {HOURS_OF_DAY.map(hour => (
          <React.Fragment key={hour}>
            <div className={`row-span-${TIME_SLOTS_PER_HOUR} bg-gray-100 text-right p-2 pr-4 text-xs font-semibold text-gray-600`}>
              {formatTime(hour)}
            </div>
            {DAYS_OF_WEEK.map((_, dayIndex) => {
              const slots = Array.from({ length: TIME_SLOTS_PER_HOUR }, (_, i) => hour + i / TIME_SLOTS_PER_HOUR);
              return slots.map(time => {
                const caseOnSlot = scheduleMap.get(`${dayIndex}-${time}`);
                const isSelected = selectionArea && dayIndex >= selectionArea.minDay && dayIndex <= selectionArea.maxDay && time >= selectionArea.minTime && time <= selectionArea.maxTime;
                
                let slotClass = "bg-white hover:bg-blue-50 cursor-pointer";
                if(caseOnSlot) {
                    slotClass = `${caseOnSlot.color} cursor-pointer hover:opacity-80`;
                } else if(isSelected) {
                    slotClass = "bg-blue-200 opacity-70";
                }

                return (
                  <div
                    key={`${dayIndex}-${time}`}
                    className={`h-6 ${slotClass}`}
                    onMouseDown={() => handleMouseDown(dayIndex, time)}
                    onMouseEnter={() => handleMouseEnter(dayIndex, time)}
                    onClick={() => handleSlotClick(dayIndex, time)}
                  ></div>
                );
              });
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};