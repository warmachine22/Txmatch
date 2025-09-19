import { type Therapist, type Case, type TimeSlot } from '../types';
import { CASE_COLORS } from '../constants';

const therapistNames = [
  "Dr. Eleanor Vance", "Dr. John Montague", "Dr. Theodora Justina", "Dr. Luke Sanderson",
  "Dr. Arthur Abraham", "Dr. Emily Richardson", "Dr. Benjamin Carter", "Dr. Olivia Chen",
  "Dr. Samuel Rodriguez", "Dr. Sophia Williams"
];

const caseNames = [
  "Leo S.", "Mia R.", "Noah B.", "Ava G.", "Liam P.", "Isabella C.", "Lucas H.", "Zoe M.",
  "Mason T.", "Riley J.", "Ethan W.", "Lily A.", "Aiden K.", "Harper D.", "James V.",
  "Evelyn N.", "Logan F.", "Abigail L.", "Jackson Q.", "Ella Z."
];

// Real addresses in Queens, NY
const queensAddresses = [
  "30-10 30th Ave, Astoria, NY 11102", "45-18 Court Sq W, Long Island City, NY 11101",
  "135-20 39th Ave, Flushing, NY 11354", "70-10 Austin St, Forest Hills, NY 11375",
  "89-11 162nd St, Jamaica, NY 11432", "21-50 45th Rd, Long Island City, NY 11101",
  "37-02 Broadway, Astoria, NY 11103", "40-22 Main St, Flushing, NY 11354",
  "108-01 72nd Ave, Forest Hills, NY 11375", "147-15 Jamaica Ave, Jamaica, NY 11435",
  "34-01 38th Ave, Astoria, NY 11101", "2-01 50th Ave, Long Island City, NY 11101",
  "136-17 38th Ave, Flushing, NY 11354", "71-25 Yellowstone Blvd, Forest Hills, NY 11375",
  "161-10 Jamaica Ave, Jamaica, NY 11432", "25-31 Broadway, Astoria, NY 11106",
  "11-11 44th Rd, Long Island City, NY 11101", "138-28 Northern Blvd, Flushing, NY 11354",
  "67-02 Austin St, Forest Hills, NY 11375", "175-20 Hillside Ave, Jamaica, NY 11432"
];

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const getRandomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateSeedData = (): Therapist[] => {
  const shuffledAddresses = shuffleArray(queensAddresses);
  const shuffledCaseNames = shuffleArray(caseNames);
  let addressIndex = 0;
  let caseNameIndex = 0;

  const therapists: Therapist[] = therapistNames.map((name, index): Therapist => {
    const totalHoursGoal = getRandomInt(10, 20);
    let currentTotalHours = 0;
    const cases: Case[] = [];
    const numCases = getRandomInt(1, 3);
    const occupiedSlots = new Set<string>();

    for (let i = 0; i < numCases && currentTotalHours < totalHoursGoal; i++) {
        if (addressIndex >= shuffledAddresses.length || caseNameIndex >= shuffledCaseNames.length) break;
        
        const caseHoursGoal = Math.max(2, Math.floor((totalHoursGoal - currentTotalHours) / (numCases - i)));
        const schedule: TimeSlot[] = [];
        let scheduledHours = 0;
        
        // Schedule in 1, 2, or 4 hour chunks
        while(scheduledHours < caseHoursGoal){
            const chunkOptions = [1, 2, 4].filter(c => c <= caseHoursGoal-scheduledHours);
            if(chunkOptions.length === 0) break;
            const chunkDuration = chunkOptions[Math.floor(Math.random()*chunkOptions.length)];
            
            let attempts = 0;
            let slotFound = false;
            while(attempts < 50 && !slotFound){
                const day = getRandomInt(0, 4); // Mon-Fri
                const startTime = getRandomInt(8, 17); // 8 AM to 5 PM start
                
                let isAvailable = true;
                const potentialSlots: TimeSlot[] = [];
                for(let t = 0; t < chunkDuration; t += 0.5){
                    const slotKey = `${day}-${startTime + t}`;
                    if(occupiedSlots.has(slotKey)){
                        isAvailable = false;
                        break;
                    }
                    potentialSlots.push({ day, time: startTime + t });
                }

                if(isAvailable){
                    potentialSlots.forEach(s => {
                        schedule.push(s);
                        occupiedSlots.add(`${s.day}-${s.time}`);
                    });
                    scheduledHours += chunkDuration;
                    slotFound = true;
                }
                attempts++;
            }
            if(!slotFound) break; // Cannot find a slot, move to next case
        }
        
        if(schedule.length > 0){
             cases.push({
                id: `case_${Date.now()}_${index}_${i}`,
                name: shuffledCaseNames[caseNameIndex++],
                address: shuffledAddresses[addressIndex++],
                color: CASE_COLORS[cases.length % CASE_COLORS.length],
                schedule: schedule,
            });
            currentTotalHours = occupiedSlots.size * 0.5;
        }
    }

    return {
      id: `therapist_${Date.now()}_${index}`,
      name,
      cases,
    };
  });

  return therapists.sort((a,b) => a.name.localeCompare(b.name));
};