import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { RoutineGroup } from '@/components/RoutineGroup';
import Layout from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getUserGroups, getUserRoutines, getWeekdaySchedule, getGroupRoutines, getCompletionsByDate, addCompletion, removeCompletion, } from '@/lib/firebase';
const mockData = {
    date: new Date(),
    groups: [
        {
            id: 1,
            name: "Morning Routines",
            icon: "sun",
            timeRange: "6:00 AM - 8:00 AM",
            routines: [
                {
                    id: 1,
                    name: "Morning Meditation",
                    priority: "high",
                    expectedTime: "10 min",
                    completed: true,
                    completedAt: "2023-05-20T06:15:00Z"
                },
                {
                    id: 2,
                    name: "Breakfast",
                    priority: "high",
                    expectedTime: "20 min",
                    completed: false
                },
                {
                    id: 3,
                    name: "Daily Planning",
                    priority: "medium",
                    expectedTime: "15 min",
                    completed: false
                }
            ]
        },
        {
            id: 2,
            name: "Work Routines",
            icon: "briefcase",
            timeRange: "9:00 AM - 5:00 PM",
            routines: [
                {
                    id: 4,
                    name: "Check Emails",
                    priority: "medium",
                    expectedTime: "20 min",
                    completed: false
                },
                {
                    id: 5,
                    name: "Team Meeting",
                    priority: "high",
                    expectedTime: "60 min",
                    completed: false
                },
                {
                    id: 6,
                    name: "Project Work",
                    priority: "high",
                    expectedTime: "120 min",
                    completed: false
                }
            ]
        },
        {
            id: 3,
            name: "Evening Routines",
            icon: "moon",
            timeRange: "6:00 PM - 10:00 PM",
            routines: [
                {
                    id: 7,
                    name: "Dinner",
                    priority: "high",
                    expectedTime: "45 min",
                    completed: false
                },
                {
                    id: 8,
                    name: "Evening Workout",
                    priority: "medium",
                    expectedTime: "45 min",
                    completed: false
                },
                {
                    id: 9,
                    name: "Reading",
                    priority: "low",
                    expectedTime: "30 min",
                    completed: false
                }
            ]
        }
    ]
};
export default function Dashboard() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const formattedDate = format(selectedDate, 'EEEE, MMMM d, yyyy');
    const dateParam = format(selectedDate, 'yyyy-MM-dd');
    const { data: userGroups = [] } = useQuery(['groups'], () => getUserGroups(user?.uid || ''), { enabled: !!user });
    const { data: userRoutines = [] } = useQuery(['routines'], () => getUserRoutines(user?.uid || ''), { enabled: !!user });
    const fetchSchedules = async () => {
        if (!userRoutines || userRoutines.length === 0) {
            return [];
        }
        return Promise.all(userRoutines.map((routine) => getWeekdaySchedule(routine.id).catch((error) => {
            console.error(`Error al obtener programación para rutina ${routine.id}:`, error);
            return {
                routineId: routine.id,
                monday: true,
                tuesday: true,
                wednesday: true,
                thursday: true,
                friday: true,
                saturday: true,
                sunday: true,
            };
        })));
    };
    const { data: weekdaySchedules = [] } = useQuery(['weekdaySchedules', userRoutines], fetchSchedules, { enabled: userRoutines.length > 0 });
    const { data: completions = [] } = useQuery(['completions', dateParam], () => getCompletionsByDate(user?.uid || '', dateParam), { enabled: !!user && !!dateParam });
    const { data: groupRoutines = [] } = useQuery(['groupRoutines'], getGroupRoutines);
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['routines', 'daily', dateParam, userGroups, userRoutines, weekdaySchedules, completions, groupRoutines],
        queryFn: async () => {
            try {
                const currentDayIndex = selectedDate.getDay();
                const weekdayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                const currentDay = weekdayMap[currentDayIndex];
                const routinesForToday = userRoutines.filter(routine => {
                    const schedule = weekdaySchedules.find((schedule) => schedule.routineId === routine.id);
                    if (schedule) {
                        return schedule[currentDay] === true;
                    }
                    return format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                });
                let routinesWithCompletionStatus = routinesForToday.map(routine => {
                    const isCompleted = completions.some((completion) => completion.routineId === routine.id &&
                        format(new Date(completion.completedAt), 'yyyy-MM-dd') === dateParam);
                    return {
                        ...routine,
                        completed: isCompleted,
                        completedAt: isCompleted ?
                            completions.find((c) => c.routineId === routine.id)?.completedAt :
                            undefined
                    };
                });
                routinesWithCompletionStatus.sort((a, b) => {
                    const priorityOrder = { high: 1, medium: 2, low: 3 };
                    const priorityComparison = priorityOrder[a.priority] - priorityOrder[b.priority];
                    if (priorityComparison !== 0) {
                        return priorityComparison;
                    }
                    const getMinutes = (timeString) => {
                        const [hours, minutes] = timeString.split(':').map(Number);
                        return (hours * 60) + minutes;
                    };
                    const aMinutes = getMinutes(a.expectedTime);
                    const bMinutes = getMinutes(b.expectedTime);
                    return aMinutes - bMinutes;
                });
                const groupedRoutines = userGroups.map(group => {
                    const routinesInThisGroup = routinesWithCompletionStatus.filter(routine => {
                        return groupRoutines.some((gr) => gr.routineId === routine.id && gr.groupId === group.id);
                    });
                    return {
                        id: group.id,
                        name: group.name,
                        icon: group.icon,
                        timeRange: group.timeRange || "",
                        routines: routinesInThisGroup
                    };
                });
                const ungroupedRoutines = routinesWithCompletionStatus.filter(routine => {
                    return !groupRoutines.some((gr) => gr.routineId === routine.id);
                });
                if (ungroupedRoutines.length > 0) {
                    groupedRoutines.push({
                        id: 0,
                        name: "Sin grupo",
                        icon: "folder",
                        timeRange: "",
                        routines: ungroupedRoutines
                    });
                }
                return groupedRoutines.filter(group => group.routines.length > 0);
            }
            catch (error) {
                console.error("Error procesando rutinas para el dashboard:", error);
                throw error;
            }
        }
    });
    const toggleCompletionMutation = useMutation({
        mutationFn: async ({ routineId, completed }) => {
            if (!user)
                return;
            if (completed) {
                await addCompletion({
                    userId: user.uid,
                    routineId,
                    completedAt: new Date().toISOString(),
                });
            }
            else {
                await removeCompletion(user.uid, routineId, dateParam);
            }
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['routines', 'daily', dateParam]);
            queryClient.invalidateQueries(['completions', dateParam]);
            queryClient.invalidateQueries(['completions', 'stats']);
        }
    });
    const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    const handleToggleCompletion = (id, completed) => {
        if (isToday) {
            const updatedData = data?.map(group => ({
                ...group,
                routines: group.routines.map(routine => routine.id === id
                    ? { ...routine, completed: completed }
                    : routine)
            }));
            queryClient.setQueryData(['routines', 'daily', dateParam], updatedData);
            toggleCompletionMutation.mutate({ routineId: id, completed });
        }
        else {
        }
    };
    const goToPrevDay = () => {
        setSelectedDate(prev => subDays(prev, 1));
    };
    const goToNextDay = () => {
        setSelectedDate(prev => addDays(prev, 1));
    };
    const goToToday = () => {
        setSelectedDate(new Date());
    };
    const totalRoutines = data?.reduce((sum, group) => sum + group.routines.length, 0) || 0;
    const completedRoutines = data?.reduce((sum, group) => sum + group.routines.filter(r => r.completed).length, 0) || 0;
    const completionPercentage = totalRoutines > 0
        ? Math.round((completedRoutines / totalRoutines) * 100)
        : 0;
    return (_jsxs(Layout, { children: [_jsx(Card, { className: "mb-6", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: goToPrevDay, children: [_jsx(ChevronLeft, { className: "w-4 h-4 mr-1" }), "Previous Day"] }), _jsxs("div", { className: "flex items-center", children: [_jsx(Calendar, { className: "w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" }), _jsx("h2", { className: "text-lg font-medium", children: formattedDate })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: goToToday, children: "Today" }), _jsxs(Button, { variant: "outline", size: "sm", onClick: goToNextDay, children: ["Next Day", _jsx(ChevronRight, { className: "w-4 h-4 ml-1" })] })] })] }) }) }), _jsxs(Card, { className: "mb-6", children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { children: "Daily Progress" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsxs("div", { children: [_jsxs("span", { className: "text-3xl font-bold", children: [completedRoutines, "/", totalRoutines] }), _jsx("span", { className: "ml-2 text-gray-500 dark:text-gray-400", children: "routines completed" })] }), _jsx("div", { className: "text-3xl font-bold", children: _jsxs("span", { className: completionPercentage >= 75 ? 'text-green-600 dark:text-green-400' :
                                                completionPercentage >= 50 ? 'text-blue-600 dark:text-blue-400' :
                                                    completionPercentage >= 25 ? 'text-yellow-600 dark:text-yellow-400' :
                                                        'text-red-600 dark:text-red-400', children: [completionPercentage, "%"] }) })] }), _jsx("div", { className: "w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full", children: _jsx("div", { className: `h-4 rounded-full ${completionPercentage >= 75 ? 'bg-green-500 dark:bg-green-400' :
                                        completionPercentage >= 50 ? 'bg-blue-500 dark:bg-blue-400' :
                                            completionPercentage >= 25 ? 'bg-yellow-500 dark:bg-yellow-400' :
                                                'bg-red-500 dark:bg-red-400'}`, style: { width: `${completionPercentage}%` } }) })] })] }), isLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" }), _jsx("p", { children: "Loading routines..." })] })) : isError ? (_jsxs("div", { className: "text-center py-8 text-red-600 dark:text-red-400", children: [_jsx("p", { children: "Error loading routines. Please try again." }), _jsxs(Button, { variant: "outline", className: "mt-4", onClick: () => refetch(), children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Retry"] })] })) : data && data.length > 0 ? (data.map(group => (_jsx(RoutineGroup, { group: group, onToggleCompletion: handleToggleCompletion, isEditable: isToday }, group.id)))) : (_jsxs("div", { className: "text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700", children: [_jsx("h3", { className: "text-xl font-medium mb-2", children: "No routines scheduled for today" }), _jsx("p", { className: "text-gray-500 dark:text-gray-400 mb-6", children: "You don't have any routines scheduled for this day." }), _jsxs(Button, { variant: "primary", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Routine"] })] }))] }));
}
