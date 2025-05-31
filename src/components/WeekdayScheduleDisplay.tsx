import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWeekdaySchedule } from '@/lib/firebase';
import type { DayKey, WeekdaySchedule } from '@/lib/types';

const DAYS: { key: keyof WeekdaySchedule; label: string }[] = [
  { key: 'monday', label: 'L' },
  { key: 'tuesday', label: 'M' },
  { key: 'wednesday', label: 'X' },
  { key: 'thursday', label: 'J' },
  { key: 'friday', label: 'V' },
  { key: 'saturday', label: 'S' },
  { key: 'sunday', label: 'D' },
];

const dayClass = (active: boolean) =>
  `w-6 h-6 flex items-center justify-center rounded text-xs font-semibold transition-colors ${
    active
      ? 'bg-blue-600 text-white shadow'
      : 'text-gray-400 dark:text-gray-500'
  }`;

export function WeekdayScheduleDisplay({ routineId }: { routineId: string }) {
  const { data } = useQuery<WeekdaySchedule>({
    queryKey: ['weekdaySchedule', routineId],
    queryFn: () => getWeekdaySchedule(routineId),
  });

  if (!data) return null;

  return (
    <div className="flex gap-1 mt-2">
      {DAYS.map(({ key, label }) => (
        <div key={key} className={dayClass(data[key as DayKey])}>
          {label}
        </div>
      ))}
    </div>
  );
}
