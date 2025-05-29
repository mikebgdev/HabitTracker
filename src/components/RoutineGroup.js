import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { RoutineItem } from './RoutineItem';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChevronUp, ChevronDown, Clock } from 'lucide-react';
export function RoutineGroup({ group, onToggleCompletion, isEditable = true, }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const totalRoutines = group.routines.length;
    const completedRoutines = group.routines.filter((r) => r.completed).length;
    const completionPercentage = totalRoutines > 0
        ? Math.round((completedRoutines / totalRoutines) * 100)
        : 0;
    return (_jsxs(Card, { className: "mb-6", children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsxs("button", { onClick: () => setIsExpanded(!isExpanded), className: "w-full flex justify-between items-center focus:outline-none", "aria-expanded": isExpanded, children: [_jsxs("div", { className: "flex items-center", children: [_jsx(CardTitle, { children: group.name }), group.timeRange && (_jsxs("div", { className: "ml-4 text-sm text-gray-500 dark:text-gray-400 flex items-center", children: [_jsx(Clock, { className: "w-3 h-3 mr-1" }), group.timeRange] }))] }), _jsxs("div", { className: "flex items-center", children: [_jsxs("div", { className: "mr-4 text-sm", children: [_jsxs("span", { className: completionPercentage === 100
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-blue-600 dark:text-blue-400', children: [completedRoutines, "/", totalRoutines] }), _jsxs("span", { className: "text-gray-500 dark:text-gray-400 ml-2", children: ["(", completionPercentage, "%)"] })] }), isExpanded ? (_jsx(ChevronUp, { className: "w-5 h-5 text-gray-400" })) : (_jsx(ChevronDown, { className: "w-5 h-5 text-gray-400" }))] })] }), _jsx("div", { className: "w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-3", children: _jsx("div", { className: `h-1.5 rounded-full ${completionPercentage === 100
                                ? 'bg-green-500 dark:bg-green-400'
                                : 'bg-blue-500 dark:bg-blue-400'}`, style: { width: `${completionPercentage}%` } }) })] }), isExpanded && (_jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [group.routines.map((routine) => (_jsx(RoutineItem, { routine: routine, onToggleCompletion: onToggleCompletion, isEditable: isEditable }, routine.id))), group.routines.length === 0 && (_jsx("div", { className: "text-center py-6 text-gray-500 dark:text-gray-400", children: "No routines in this group yet" }))] }) }))] }));
}
