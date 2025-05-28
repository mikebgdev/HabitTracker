import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// @ts-nocheck
import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, eachDayOfInterval } from "date-fns";
const getColorClass = (percentage) => {
    if (percentage >= 80)
        return "text-green-500";
    if (percentage >= 50)
        return "text-amber-500";
    return "text-red-500";
};
export default function ProgressPage() {
    const [timeRange, setTimeRange] = useState("week");
    const today = new Date();
    const getDateRange = () => {
        switch (timeRange) {
            case "week":
                return { start: subDays(today, 6), end: today };
            case "month":
                return { start: subDays(today, 29), end: today };
            case "year":
                return { start: subDays(today, 364), end: today };
            default:
                return { start: subDays(today, 6), end: today };
        }
    };
    const dateRange = getDateRange();
    const { data: completionStats = [], isLoading } = useQuery({
        queryKey: ['/api/completions/stats', format(dateRange.start, 'yyyy-MM-dd'), format(dateRange.end, 'yyyy-MM-dd')],
    });
    const { data: userRoutines = [] } = useQuery({
        queryKey: ['/api/routines'],
    });
    const generateDailyCompletionData = () => {
        const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
        return days.map(day => {
            const dayStr = format(day, "yyyy-MM-dd");
            const isToday = dayStr === format(new Date(), 'yyyy-MM-dd');
            const total = userRoutines.length;
            const uniqueCompletedIds = new Set();
            completionStats.forEach((completion) => {
                if (format(new Date(completion.completedAt), 'yyyy-MM-dd') === dayStr) {
                    uniqueCompletedIds.add(completion.routineId);
                }
            });
            const completed = uniqueCompletedIds.size;
            const percentage = isToday && uniqueCompletedIds.size > 0
                ? Math.min(Math.round((completed / total) * 100), 100)
                : total > 0 ? Math.min(Math.round((completed / total) * 100), 100) : 0;
            return {
                date: format(day, "MMM dd"),
                completed,
                total,
                percentage
            };
        });
    };
    const dailyData = generateDailyCompletionData();
    const generatePriorityData = () => {
        const routinesByPriority = {
            high: userRoutines.filter(r => r.priority === 'high'),
            medium: userRoutines.filter(r => r.priority === 'medium'),
            low: userRoutines.filter(r => r.priority === 'low')
        };
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const todayCompletions = completionStats.filter(c => format(new Date(c.completedAt), 'yyyy-MM-dd') === todayStr);
        const uniqueCompletedByPriority = {
            high: new Set(),
            medium: new Set(),
            low: new Set()
        };
        todayCompletions.forEach((c) => {
            const routineId = c.routineId;
            if (routinesByPriority.high.some(r => r.id === routineId)) {
                uniqueCompletedByPriority.high.add(routineId);
            }
            else if (routinesByPriority.medium.some(r => r.id === routineId)) {
                uniqueCompletedByPriority.medium.add(routineId);
            }
            else if (routinesByPriority.low.some(r => r.id === routineId)) {
                uniqueCompletedByPriority.low.add(routineId);
            }
        });
        const result = [
            {
                name: "High",
                completed: uniqueCompletedByPriority.high.size,
                expected: routinesByPriority.high.length || 1
            },
            {
                name: "Medium",
                completed: uniqueCompletedByPriority.medium.size,
                expected: routinesByPriority.medium.length || 1
            },
            {
                name: "Low",
                completed: uniqueCompletedByPriority.low.size,
                expected: routinesByPriority.low.length || 1
            }
        ];
        return result.map(item => ({
            ...item,
            completed: Math.min(Math.round((item.completed / item.expected) * 100), 100)
        }));
    };
    const priorityData = generatePriorityData();
    const todayString = format(new Date(), 'yyyy-MM-dd');
    const { data: todayCompletions = [] } = useQuery({
        queryKey: ['/api/completions', todayString],
    });
    const calculateOverallStats = () => {
        const totalRoutines = userRoutines.length || 0;
        const todayFormatted = format(new Date(), 'yyyy-MM-dd');
        const completedRoutineIds = new Set();
        completionStats.forEach((c) => {
            if (format(new Date(c.completedAt), 'yyyy-MM-dd') === todayFormatted) {
                completedRoutineIds.add(c.routineId);
            }
        });
        const completedRoutines = completedRoutineIds.size;
        const completionRate = totalRoutines > 0
            ? Math.min(Math.round((completedRoutines / totalRoutines) * 100), 100)
            : 0;
        let currentStreak = 0;
        const sortedDays = [...dailyData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        for (const day of sortedDays) {
            if (day.completed > 0) {
                currentStreak++;
            }
            else if (day.total > 0) {
                break;
            }
        }
        const routineStats = {};
        userRoutines.forEach(routine => {
            routineStats[routine.id] = {
                completed: 0,
                total: dailyData.length,
                name: routine.name
            };
        });
        completionStats.forEach((completion) => {
            if (routineStats[completion.routineId]) {
                routineStats[completion.routineId].completed++;
            }
        });
        let mostCompletedRoutine = { name: "Ninguna", rate: 0 };
        let leastCompletedRoutine = { name: "Ninguna", rate: 100 };
        Object.values(routineStats).forEach(({ completed, total, name }) => {
            if (total > 0) {
                const rate = (completed / total) * 100;
                if (rate > mostCompletedRoutine.rate) {
                    mostCompletedRoutine = { name, rate };
                }
                if (rate < leastCompletedRoutine.rate && total > 0) {
                    leastCompletedRoutine = { name, rate };
                }
            }
        });
        return {
            totalRoutines,
            completedRoutines,
            completionRate,
            streak: currentStreak,
            mostCompletedRoutine: mostCompletedRoutine.name,
            leastCompletedRoutine: leastCompletedRoutine.name,
            routineStats
        };
    };
    const calculatedStats = calculateOverallStats();
    const { totalRoutines, completedRoutines, completionRate, streak, mostCompletedRoutine, leastCompletedRoutine, routineStats } = calculatedStats;
    const mostCompletedStats = Object.values(routineStats).find(r => r.name === mostCompletedRoutine) || {
        completed: 0,
        total: 0
    };
    const leastCompletedStats = Object.values(routineStats).find(r => r.name === leastCompletedRoutine) || {
        completed: 0,
        total: 0
    };
    return (_jsxs(Layout, { children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Progreso y An\u00E1lisis" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Seguimiento de tus rutinas a lo largo del tiempo" })] }), _jsx("div", { className: "mt-4 md:mt-0 w-full md:w-48", children: _jsxs(Select, { value: timeRange, onValueChange: setTimeRange, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Seleccionar per\u00EDodo" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "week", children: "\u00DAltimos 7 d\u00EDas" }), _jsx(SelectItem, { value: "month", children: "\u00DAltimos 30 d\u00EDas" }), _jsx(SelectItem, { value: "year", children: "\u00DAltimos 365 d\u00EDas" })] })] }) })] }), _jsxs("div", { className: "grid gap-6 mb-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Tasa de Completado" }) }), _jsx(CardContent, { children: (() => {
                                    const todayFormatted = format(new Date(), 'yyyy-MM-dd');
                                    const uniqueCompletedIds = new Set();
                                    completionStats.forEach((completion) => {
                                        if (format(new Date(completion.completedAt), 'yyyy-MM-dd') === todayFormatted) {
                                            uniqueCompletedIds.add(completion.routineId);
                                        }
                                    });
                                    const totalCount = userRoutines.length || 0;
                                    const completedCount = uniqueCompletedIds.size;
                                    const percentage = totalCount > 0
                                        ? Math.min(Math.round((completedCount / totalCount) * 100), 100)
                                        : 0;
                                    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: `text-3xl font-bold ${getColorClass(percentage)}`, children: [percentage, "%"] }), _jsx(ProgressBar, { value: percentage, className: "mt-2 h-2" }), _jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-2", children: [completedCount, " de ", totalCount, " rutinas completadas"] })] }));
                                })() })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Racha Actual" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-3xl font-bold text-gray-900 dark:text-white", children: [streak, " d\u00EDas"] }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-2", children: "\u00A1Sigue as\u00ED! Lo est\u00E1s haciendo genial." })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "M\u00E1s Completada" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-lg font-bold text-gray-900 dark:text-white", children: mostCompletedRoutine }), _jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-2", children: [mostCompletedStats.completed, " de ", mostCompletedStats.total, " d\u00EDas"] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Necesita Mejorar" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-lg font-bold text-gray-900 dark:text-white", children: leastCompletedRoutine }), _jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-2", children: ["Completada solo ", leastCompletedStats.completed, " de ", leastCompletedStats.total, " d\u00EDas"] })] })] })] }), _jsxs(Card, { className: "mb-6", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Daily Completion Rate" }), _jsx(CardDescription, { children: "Percentage of routines completed each day" })] }), _jsx(CardContent, { children: _jsx("div", { className: "h-80", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: dailyData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "date" }), _jsx(YAxis, { domain: [0, 100], tickFormatter: (value) => `${value}%` }), _jsx(Tooltip, { formatter: (value) => [`${value}%`, "Completion Rate"] }), _jsx(Legend, {}), _jsx(Line, { type: "monotone", dataKey: "percentage", name: "Completion Rate", stroke: "hsl(var(--primary))", strokeWidth: 2, dot: { r: 4 }, activeDot: { r: 6 } })] }) }) }) })] }), _jsxs(Card, { className: "mb-6", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Completion by Priority" }), _jsx(CardDescription, { children: "How well you're completing routines based on priority level" })] }), _jsx(CardContent, { children: _jsx("div", { className: "h-80", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: priorityData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "name" }), _jsx(YAxis, { tickFormatter: (value) => `${value}%` }), _jsx(Tooltip, { formatter: (value) => [`${value}%`, "Completion Rate"] }), _jsx(Legend, {}), _jsx(Bar, { dataKey: "completed", name: "Completion Rate", fill: "hsl(var(--primary))" })] }) }) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Streak Calendar" }), _jsxs(CardDescription, { children: ["Your daily routine completion over the last ", timeRange === "week" ? "7" : timeRange === "month" ? "30" : "365", " days"] })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "grid grid-cols-7 gap-1", children: dailyData.slice(-35).map((day, index) => {
                                    const completionRate = day.total > 0 ? (day.completed / day.total) * 100 : 0;
                                    let bgColor = "bg-gray-100 dark:bg-gray-800";
                                    if (day.total > 0) {
                                        if (completionRate >= 80)
                                            bgColor = "bg-green-500";
                                        else if (completionRate >= 60)
                                            bgColor = "bg-green-400";
                                        else if (completionRate >= 40)
                                            bgColor = "bg-green-300";
                                        else if (completionRate >= 20)
                                            bgColor = "bg-yellow-300";
                                        else
                                            bgColor = "bg-gray-300 dark:bg-gray-600";
                                    }
                                    return (_jsx("div", { className: `w-8 h-8 rounded-sm ${bgColor} flex items-center justify-center text-xs font-medium text-white`, title: `${day.date}: ${day.completed}/${day.total} completed (${Math.round(completionRate)}%)`, children: format(new Date(day.date), 'd') }, index));
                                }) }), _jsxs("div", { className: "mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400", children: [_jsx("span", { children: "Less" }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("div", { className: "w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-sm" }), _jsx("div", { className: "w-3 h-3 bg-green-300 rounded-sm" }), _jsx("div", { className: "w-3 h-3 bg-green-400 rounded-sm" }), _jsx("div", { className: "w-3 h-3 bg-green-500 rounded-sm" })] }), _jsx("span", { children: "More" })] })] })] })] }));
}
