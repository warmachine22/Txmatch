
export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const HOURS_OF_DAY: number[] = [];
for (let i = 5; i < 23; i++) {
  HOURS_OF_DAY.push(i);
}

export const TIME_SLOTS_PER_HOUR = 2; // 30-minute slots

export const CASE_COLORS = [
  'bg-blue-300', 'bg-green-300', 'bg-yellow-300', 'bg-pink-300', 'bg-purple-300', 
  'bg-indigo-300', 'bg-teal-300', 'bg-orange-300', 'bg-red-300', 'bg-cyan-300'
];
export const CASE_BORDER_COLORS = [
    'border-blue-500', 'border-green-500', 'border-yellow-500', 'border-pink-500', 'border-purple-500', 
    'border-indigo-500', 'border-teal-500', 'border-orange-500', 'border-red-500', 'border-cyan-500'
];
