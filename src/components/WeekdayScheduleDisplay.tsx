import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWeekdaySchedule } from '@/lib/firebase';
import type { WeekdaySchedule } from '@/lib/types';

interface WeekdayScheduleDisplayProps {
  routineId: string;
}

const days: { key: keyof WeekdaySchedule; label: string }[] = [
  { key: 'monday', label: 'L' },
  { key: 'tuesday', label: 'M' },
  { key: 'wednesday', label: 'X' },
  { key: 'thursday', label: 'J' },
  { key: 'friday', label: 'V' },
  { key: 'saturday', label: 'S' },
  { key: 'sunday', label: 'D' },
];

export function WeekdayScheduleDisplay({
  routineId,
}: WeekdayScheduleDisplayProps) {
  const { data: weekdaySchedule } = useQuery<WeekdaySchedule | null>({
    queryKey: ['weekdaySchedule', routineId],
    queryFn: () => getWeekdaySchedule(routineId),
    enabled: !!routineId,
  });

  return (
    <div className="mb-4">
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
        Días de la semana
      </div>
      <div className="flex flex-wrap gap-1">
        {days.map(({ key, label }) => {
          const selected = weekdaySchedule?.[key];
          return (
            <span
              key={key}
              className={`text-xs px-2 py-1 rounded ${
                selected
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
            >
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
