import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWeekdaySchedule } from '@/lib/firebase';
import { WEEKDAYS, dayDisplayClass } from '@/lib/constants';
import type { WeekdaySchedule } from '@/lib/types';

export function WeekdayScheduleDisplay({ routineId }: { routineId: string }) {
  const { data } = useQuery<WeekdaySchedule>({
    queryKey: ['weekdaySchedule', routineId],
    queryFn: () => getWeekdaySchedule(routineId),
  });

  if (!data) return null;

  return (
    <div className="flex gap-1 mt-2">
      {WEEKDAYS.map(({ key, label }) => (
        <div key={key} className={dayDisplayClass(data[key])}>
          {label}
        </div>
      ))}
    </div>
  );
}
