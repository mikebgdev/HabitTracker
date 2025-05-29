import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { RoutineGroup } from '@/components/RoutineGroup';
import Layout from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, RefreshCw, ChevronLeft, ChevronRight, } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getUserGroups, getUserRoutines, getWeekdaySchedule, getCompletionsByDate, addCompletion, removeCompletion, } from '@/lib/firebase';
import { useI18n } from '@/contexts/I18nProvider';
export default function Dashboard() {
    const [setIsAddRoutineModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { t } = useI18n();
    const formattedDate = format(selectedDate, 'EEEE, MMMM d, yyyy');
    const dateParam = format(selectedDate, 'yyyy-MM-dd');
    const { data: userGroups = [] } = useQuery({
        queryKey: ['groups', user?.uid],
        queryFn: () => getUserGroups(user.uid),
        enabled: !!user,
    });
    const { data: userRoutines = [] } = useQuery({
        queryKey: ['routines', user?.uid],
        queryFn: () => getUserRoutines(user.uid),
        enabled: !!user,
    });
    const { data: weekdaySchedules = [] } = useQuery({
        queryKey: ['weekdaySchedules', user?.uid],
        queryFn: async () => {
            return Promise.all(userRoutines.map((routine) => getWeekdaySchedule(routine.id).catch(() => ({
                id: '0',
                routineId: routine.id,
                monday: true,
                tuesday: true,
                wednesday: true,
                thursday: true,
                friday: true,
                saturday: true,
                sunday: true,
            }))));
        },
        enabled: userRoutines.length > 0,
    });
    const { data: completions = [] } = useQuery({
        queryKey: ['completions', user?.uid, dateParam],
        queryFn: () => getCompletionsByDate(user.uid, dateParam),
        enabled: !!user,
    });
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: [
            'routines',
            'daily',
            dateParam,
            userGroups,
            userRoutines,
            weekdaySchedules,
            completions,
        ],
        queryFn: async () => {
            const weekdayMap = [
                'sunday',
                'monday',
                'tuesday',
                'wednesday',
                'thursday',
                'friday',
                'saturday',
            ];
            const currentDay = weekdayMap[selectedDate.getDay()];
            const routinesForToday = userRoutines.filter((routine) => {
                const schedule = weekdaySchedules.find((s) => s.routineId === routine.id);
                return schedule ? schedule[currentDay] : false;
            });
            const routinesWithCompletion = routinesForToday.map((routine) => {
                const completed = completions.some((c) => c.routineId === routine.id &&
                    format(new Date(c.completedAt), 'yyyy-MM-dd') === dateParam);
                return {
                    ...routine,
                    completed,
                    completedAt: completed
                        ? completions.find((c) => c.routineId === routine.id)?.completedAt
                        : undefined,
                };
            });
            routinesWithCompletion.sort((a, b) => {
                const order = { high: 1, medium: 2, low: 3 };
                const byPriority = order[a.priority] - order[b.priority];
                if (byPriority !== 0)
                    return byPriority;
                const toMinutes = (t) => {
                    const [h, m] = t.split(':').map(Number);
                    return h * 60 + m;
                };
                return toMinutes(a.expectedTime) - toMinutes(b.expectedTime);
            });
            const grouped = userGroups.map((group) => ({
                ...group,
                routines: routinesWithCompletion.filter((r) => r.groupId === group.id),
            }));
            const ungrouped = routinesWithCompletion.filter((r) => !r.groupId);
            if (ungrouped.length > 0 && user) {
                grouped.push({
                    id: 'ungrouped',
                    name: t('dashboard.ungrouped'),
                    icon: 'folder',
                    timeRange: '',
                    routines: ungrouped,
                    userId: user.uid,
                });
            }
            return grouped.filter((group) => group.routines.length > 0);
        },
    });
    const toggleCompletionMutation = useMutation({
        mutationFn: async ({ routineId, completed, }) => {
            if (!user)
                return;
            completed
                ? await addCompletion({
                    userId: user.uid,
                    routineId,
                    completedAt: new Date().toISOString(),
                })
                : await removeCompletion(user.uid, routineId, dateParam);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['routines', 'daily', dateParam],
            });
            queryClient.invalidateQueries({ queryKey: ['completions', dateParam] });
            queryClient.invalidateQueries({ queryKey: ['completions', 'stats'] });
        },
    });
    const isToday = dateParam === format(new Date(), 'yyyy-MM-dd');
    const handleToggleCompletion = (id, completed) => {
        if (!isToday)
            return;
        const updated = data?.map((group) => ({
            ...group,
            routines: group.routines.map((r) => r.id === id ? { ...r, completed } : r),
        }));
        queryClient.setQueryData(['routines', 'daily', dateParam], updated);
        toggleCompletionMutation.mutate({ routineId: id, completed });
    };
    const total = data?.reduce((sum, g) => sum + g.routines.length, 0) || 0;
    const done = data?.reduce((sum, g) => sum + g.routines.filter((r) => r.completed).length, 0) || 0;
    const percentage = total > 0 ? Math.round((done / total) * 100) : 0;
    return (_jsxs(Layout, { children: [_jsx(Card, { className: "mb-6", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => setSelectedDate(subDays(selectedDate, 1)), children: [_jsx(ChevronLeft, { className: "w-4 h-4 mr-1" }), ' ', t('dashboard.previousDay')] }), _jsxs("div", { className: "flex items-center", children: [_jsx(Calendar, { className: "w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" }), _jsx("h2", { className: "text-lg font-medium", children: formattedDate })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => setSelectedDate(new Date()), children: t('dashboard.today') }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => setSelectedDate(addDays(selectedDate, 1)), children: [t('dashboard.nextDay'), ' ', _jsx(ChevronRight, { className: "w-4 h-4 ml-1" })] })] })] }) }) }), _jsxs(Card, { className: "mb-6", children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { children: t('dashboard.dailyProgress') }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsxs("div", { children: [_jsxs("span", { className: "text-3xl font-bold", children: [done, "/", total] }), _jsx("span", { className: "ml-2 text-gray-500 dark:text-gray-400", children: t('dashboard.completed') })] }), _jsx("div", { className: "text-3xl font-bold", children: _jsxs("span", { className: percentage >= 75
                                                ? 'text-green-600 dark:text-green-400'
                                                : percentage >= 50
                                                    ? 'text-blue-600 dark:text-blue-400'
                                                    : percentage >= 25
                                                        ? 'text-yellow-600 dark:text-yellow-400'
                                                        : 'text-red-600 dark:text-red-400', children: [percentage, "%"] }) })] }), _jsx("div", { className: "w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full", children: _jsx("div", { className: `h-4 rounded-full ${percentage >= 75
                                        ? 'bg-green-500 dark:bg-green-400'
                                        : percentage >= 50
                                            ? 'bg-blue-500 dark:bg-blue-400'
                                            : percentage >= 25
                                                ? 'bg-yellow-500 dark:bg-yellow-400'
                                                : 'bg-red-500 dark:bg-red-400'}`, style: { width: `${percentage}%` } }) })] })] }), isLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" }), _jsx("p", { children: t('dashboard.loading') })] })) : isError ? (_jsxs("div", { className: "text-center py-8 text-red-600 dark:text-red-400", children: [_jsx("p", { children: t('dashboard.errorLoading') }), _jsxs(Button, { variant: "outline", className: "mt-4", onClick: () => refetch(), children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), " ", t('dashboard.retry')] })] })) : data?.length ? (data.map((group) => (_jsx(RoutineGroup, { group: group, onToggleCompletion: handleToggleCompletion, isEditable: isToday }, group.id)))) : (_jsxs("div", { className: "text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700", children: [_jsx("h3", { className: "text-xl font-medium mb-2", children: t('dashboard.noRoutinesTitle') }), _jsx("p", { className: "text-gray-500 dark:text-gray-400 mb-6", children: t('dashboard.noRoutinesSubtitle') }), _jsxs(Button, { onClick: () => setIsAddRoutineModalOpen(true), children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), " ", t('dashboard.addRoutine')] })] }))] }));
}
