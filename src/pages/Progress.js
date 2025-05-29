import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserRoutines, getCompletionsInRange, getCompletionsByDate } from "@/lib/firebase";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { useI18n } from '@/contexts/I18nProvider';
const getColorClass = (percentage) => {
    if (percentage >= 80)
        return "text-green-500";
    if (percentage >= 50)
        return "text-amber-500";
    return "text-red-500";
};
export default function ProgressPage() {
    const { t } = useI18n();
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
    const todayString = format(today, 'yyyy-MM-dd');
    const { user } = useAuth();
    const { data: completionStats = [] } = useQuery({
        queryKey: [
            'completionsRange',
            user?.uid,
            format(dateRange.start, 'yyyy-MM-dd'),
            format(dateRange.end, 'yyyy-MM-dd'),
        ],
        queryFn: () => getCompletionsInRange(user.uid, format(dateRange.start, 'yyyy-MM-dd'), format(dateRange.end, 'yyyy-MM-dd')),
        enabled: !!user,
    });
    const { data: userRoutines = [] } = useQuery({
        queryKey: ['routines', user?.uid],
        queryFn: () => getUserRoutines(user.uid),
        enabled: !!user,
    });
    const { data: todayCompletions = [] } = useQuery({
        queryKey: ['completionsByDate', user?.uid, todayString],
        queryFn: () => getCompletionsByDate(user.uid, todayString),
        enabled: !!user,
    });
    const dailyData = eachDayOfInterval({ start: dateRange.start, end: dateRange.end }).map(day => {
        const dayStr = format(day, "yyyy-MM-dd");
        const completed = new Set(completionStats.filter(c => format(new Date(c.completedAt), 'yyyy-MM-dd') === dayStr).map(c => c.routineId)).size;
        const total = userRoutines.length;
        const percentage = total > 0 ? Math.min(Math.round((completed / total) * 100), 100) : 0;
        return {
            date: format(day, "MMM dd"),
            completed,
            total,
            percentage
        };
    });
    const priorityData = ['high', 'medium', 'low'].map(priority => {
        const expected = userRoutines.filter(r => r.priority === priority).length || 1;
        const completed = new Set(todayCompletions.filter(c => userRoutines.find(r => r.id === c.routineId && r.priority === priority)).map(c => c.routineId)).size;
        return {
            name: priority.charAt(0).toUpperCase() + priority.slice(1),
            completed: Math.min(Math.round((completed / expected) * 100), 100)
        };
    });
    const routineStats = userRoutines.reduce((acc, r) => {
        acc[r.id] = { completed: 0, total: dailyData.length, name: r.name };
        return acc;
    }, {});
    completionStats.forEach(c => {
        if (routineStats[c.routineId])
            routineStats[c.routineId].completed++;
    });
    const routineArray = Object.values(routineStats);
    const mostCompletedRoutine = routineArray.reduce((max, r) => (r.completed / r.total > max.completed / max.total ? r : max), { completed: 0, total: 1, name: 'Ninguna' });
    const leastCompletedRoutine = routineArray.reduce((min, r) => (r.completed / r.total < min.completed / min.total ? r : min), { completed: Infinity, total: 1, name: 'Ninguna' });
    const streak = dailyData.reverse().reduce((acc, d) => d.completed > 0 ? acc + 1 : 0, 0);
    return (_jsxs(Layout, { children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: t('progress.title') }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: t('progress.description') })] }), _jsx("div", { className: "mt-4 md:mt-0 w-full md:w-48", children: _jsxs(Select, { value: timeRange, onValueChange: setTimeRange, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: t('progress.rangePlaceholder') }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "week", children: t('progress.rangeWeek') }), _jsx(SelectItem, { value: "month", children: t('progress.rangeMonth') }), _jsx(SelectItem, { value: "year", children: t('progress.rangeYear') })] })] }) })] }), _jsxs("div", { className: "grid gap-6 mb-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: t('progress.completionRate') }) }), _jsx(CardContent, { children: (() => {
                                    const totalCount = userRoutines.length || 0;
                                    const completedCount = new Set(todayCompletions.map(c => c.routineId)).size;
                                    const percentage = totalCount > 0
                                        ? Math.min(Math.round((completedCount / totalCount) * 100), 100)
                                        : 0;
                                    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: `text-3xl font-bold ${getColorClass(percentage)}`, children: [percentage, "%"] }), _jsx(ProgressBar, { value: percentage, className: "mt-2 h-2" }), _jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-2", children: [completedCount, " de ", totalCount, " rutinas completadas"] })] }));
                                })() })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: t('progress.streakCalendar') }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-3xl font-bold text-gray-900 dark:text-white", children: [streak, " ", t('time.days')] }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-2", children: t('progress.streakMessage') })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: t('progress.mostCompletedTitle') }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-lg font-bold text-gray-900 dark:text-white", children: mostCompletedRoutine.name }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-2", children: t('progress.mostCompletedStats', {
                                            completed: mostCompletedRoutine.completed,
                                            total: mostCompletedRoutine.total
                                        }) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: t('progress.leastCompletedTitle') }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-lg font-bold text-gray-900 dark:text-white", children: leastCompletedRoutine.name }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-2", children: t('progress.leastCompletedStats', {
                                            completed: leastCompletedRoutine.completed,
                                            total: leastCompletedRoutine.total
                                        }) })] })] })] }), _jsxs(Card, { className: "mb-6", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: t('progress.dailyCompletion') }), _jsx(CardDescription, { children: t('progress.dailyCompletionDescription') })] }), _jsx(CardContent, { children: _jsx("div", { className: "h-80", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: dailyData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "date" }), _jsx(YAxis, { domain: [0, 100], tickFormatter: (value) => `${value}%` }), _jsx(Tooltip, { formatter: (value) => [`${value}%`, "Completion Rate"] }), _jsx(Legend, {}), _jsx(Line, { type: "monotone", dataKey: "percentage", name: "Completion Rate", stroke: "hsl(var(--primary))", strokeWidth: 2, dot: { r: 4 }, activeDot: { r: 6 } })] }) }) }) })] }), _jsxs(Card, { className: "mb-6", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: t('progress.completionByPriority') }), _jsx(CardDescription, { children: t('progress.completionByPriorityDescription') })] }), _jsx(CardContent, { children: _jsx("div", { className: "h-80", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: priorityData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "name" }), _jsx(YAxis, { tickFormatter: (value) => `${value}%` }), _jsx(Tooltip, { formatter: (value) => [`${value}%`, "Completion Rate"] }), _jsx(Legend, {}), _jsx(Bar, { dataKey: "completed", name: "Completion Rate", fill: "hsl(var(--primary))" })] }) }) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: t('progress.streakCalendar') }), _jsx(CardDescription, { children: t('progress.streakCalendarDescription', { days: timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365 }) })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "grid grid-cols-7 gap-1", children: dailyData.slice(-35).map((day, index) => {
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
