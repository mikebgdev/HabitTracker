import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { getWeekdaySchedule } from "@/lib/firebase";
export function WeekdayScheduleDisplay({ routineId }) {
    const { data: weekdaySchedule } = useQuery([
        'weekdaySchedule',
        routineId,
    ], () => getWeekdaySchedule(routineId), {
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
    return (_jsxs("div", { className: "mb-4", children: [_jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400 mb-1", children: "D\u00EDas de la semana" }), _jsx("div", { className: "flex flex-wrap gap-1", children: days.map(day => {
                    const isSelected = weekdaySchedule &&
                        typeof weekdaySchedule === 'object' &&
                        weekdaySchedule !== null &&
                        day.key in weekdaySchedule &&
                        !!weekdaySchedule[day.key];
                    return (_jsx("span", { className: `text-xs px-2 py-1 rounded ${isSelected
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`, children: day.label }, day.key));
                }) })] }));
}
