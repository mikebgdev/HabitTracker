import React from "react";
import { useQuery } from "@tanstack/react-query";

interface WeekdayScheduleDisplayProps {
  routineId: number;
}

export function WeekdayScheduleDisplay({ routineId }: WeekdayScheduleDisplayProps) {
  // Query para obtener la programación de días de la semana
  const { data: weekdaySchedule } = useQuery({
    queryKey: [`/api/routines/weekday-schedule/${routineId}`],
    enabled: !!routineId,
  });
  
  const days = [
    { key: 'monday', label: 'L' },
    { key: 'tuesday', label: 'M' },
    { key: 'wednesday', label: 'X' },
    { key: 'thursday', label: 'J' },
    { key: 'friday', label: 'V' },
    { key: 'saturday', label: 'S' },
    { key: 'sunday', label: 'D' }
  ];
  
  return (
    <div className="mb-4">
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Días de la semana</div>
      <div className="flex flex-wrap gap-1">
        {days.map(day => {
          // Verificamos que weekdaySchedule exista y tenga la propiedad correspondiente
          const isSelected = weekdaySchedule && 
                             typeof weekdaySchedule === 'object' && 
                             weekdaySchedule !== null &&
                             day.key in weekdaySchedule &&
                             !!weekdaySchedule[day.key as keyof typeof weekdaySchedule];
                             
          return (
            <span 
              key={day.key}
              className={`text-xs px-2 py-1 rounded ${
                isSelected
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
            >
              {day.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}