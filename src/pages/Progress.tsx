import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserRoutines, getCompletionsInRange, getCompletionsByDate } from "@/lib/firebase";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, eachDayOfInterval } from "date-fns";
import type { Routine, Completion } from "@/lib/types";

const getColorClass = (percentage: number) => {
  if (percentage >= 80) return "text-green-500";
  if (percentage >= 50) return "text-amber-500";
  return "text-red-500";
};

export default function ProgressPage() {
  const [timeRange, setTimeRange] = useState("week");
  const today = new Date();

  const getDateRange = () => {
    switch(timeRange) {
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

  const { user } = useAuth();

  const startDateStr = format(dateRange.start, 'yyyy-MM-dd');
  const endDateStr = format(dateRange.end,   'yyyy-MM-dd');

  const { data: completionStats = [], isLoading: isLoadingStats } = useQuery<Completion[]>({
    queryKey: ['completionsRange', user?.uid, startDateStr, endDateStr],
    queryFn: () => getCompletionsInRange(user!.uid, startDateStr, endDateStr),
    enabled: !!user,
  });

  const { data: userRoutines = [], isLoading: isLoadingRoutines } = useQuery<Routine[]>({
    queryKey: ['routines', user?.uid],
    queryFn: () => getUserRoutines(user!.uid),
    enabled: !!user,
  });

  const generateDailyCompletionData = () => {
    const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
    
    return days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      const isToday = dayStr === format(new Date(), 'yyyy-MM-dd');

      const total = userRoutines.length;

      const uniqueCompletedIds = new Set();
      completionStats.forEach((completion: any) => {
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

    const routinesByPriority: Record<string, Routine[]> = {
      high: userRoutines.filter(r => r.priority === 'high'),
      medium: userRoutines.filter(r => r.priority === 'medium'),
      low: userRoutines.filter(r => r.priority === 'low')
    };

    const statsForToday = todayCompletions;

    const uniqueCompletedByPriority = {
      high: new Set<number>(),
      medium: new Set<number>(),
      low: new Set<number>()
    };

    statsForToday.forEach((c: any) => {
      const routineId = c.routineId;
      if (routinesByPriority.high.some(r => r.id === routineId)) {
        uniqueCompletedByPriority.high.add(routineId);
      } else if (routinesByPriority.medium.some(r => r.id === routineId)) {
        uniqueCompletedByPriority.medium.add(routineId);
      } else if (routinesByPriority.low.some(r => r.id === routineId)) {
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

  const { data: todayCompletions = [], isLoading: isLoadingToday } = useQuery<Completion[]>({
    queryKey: ['completionsByDate', user?.uid, todayString],
    queryFn: () => getCompletionsByDate(user!.uid, todayString),
    enabled: !!user,
  });

  const calculateOverallStats = () => {

    const totalRoutines = userRoutines.length || 0;


    const todayFormatted = format(new Date(), 'yyyy-MM-dd');

    const completedRoutineIds = new Set();

    completionStats.forEach((c: any) => {
      if (format(new Date(c.completedAt), 'yyyy-MM-dd') === todayFormatted) {
        completedRoutineIds.add(c.routineId);
      }
    });

    const completedRoutines = completedRoutineIds.size;

    const completionRate = totalRoutines > 0 
      ? Math.min(Math.round((completedRoutines / totalRoutines) * 100), 100) 
      : 0;

    let currentStreak = 0;

    const sortedDays = [...dailyData].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    for (const day of sortedDays) {
      if (day.completed > 0) {
        currentStreak++;
      } else if (day.total > 0) { 
        break;
      }
    }

    const routineStats: Record<number, { completed: number, total: number, name: string }> = {};

    userRoutines.forEach(routine => {
      routineStats[routine.id] = {
        completed: 0,
        total: dailyData.length, 
        name: routine.name
      };
    });

    completionStats.forEach((completion: any) => {
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

  const { 
    totalRoutines, 
    completedRoutines, 
    completionRate, 
    streak, 
    mostCompletedRoutine, 
    leastCompletedRoutine,
    routineStats
  } = calculatedStats;

  const mostCompletedStats = Object.values(routineStats).find(r => r.name === mostCompletedRoutine) || {
    completed: 0,
    total: 0
  };
  
  const leastCompletedStats = Object.values(routineStats).find(r => r.name === leastCompletedRoutine) || {
    completed: 0,
    total: 0
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Progreso y Análisis</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Seguimiento de tus rutinas a lo largo del tiempo
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 w-full md:w-48">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Últimos 7 días</SelectItem>
              <SelectItem value="month">Últimos 30 días</SelectItem>
              <SelectItem value="year">Últimos 365 días</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      
      <div className="grid gap-6 mb-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Tasa de Completado
            </CardTitle>
          </CardHeader>
          <CardContent>
            
            {(() => {
              const totalCount = userRoutines.length || 0;
              const completedCount = new Set(
                todayCompletions.map(c => c.routineId)
              ).size;
              const percentage = totalCount > 0
                ? Math.min(Math.round((completedCount / totalCount) * 100), 100)
                : 0;

              return (
                <>
                  <div className={`text-3xl font-bold ${getColorClass(percentage)}`}>
                    {percentage}%
                  </div>
                  <ProgressBar value={percentage} className="mt-2 h-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {completedCount} de {totalCount} rutinas completadas
                  </p>
                </>
              );
            })()}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Racha Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {streak} días
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              ¡Sigue así! Lo estás haciendo genial.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Más Completada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {mostCompletedRoutine}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {mostCompletedStats.completed} de {mostCompletedStats.total} días
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Necesita Mejorar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {leastCompletedRoutine}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Completada solo {leastCompletedStats.completed} de {leastCompletedStats.total} días
            </p>
          </CardContent>
        </Card>
      </div>
      
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Daily Completion Rate</CardTitle>
          <CardDescription>
            Percentage of routines completed each day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value) => [`${value}%`, "Completion Rate"]} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="percentage" 
                  name="Completion Rate" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2} 
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Completion by Priority</CardTitle>
          <CardDescription>
            How well you're completing routines based on priority level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value) => [`${value}%`, "Completion Rate"]} />
                <Legend />
                <Bar 
                  dataKey="completed" 
                  name="Completion Rate" 
                  fill="hsl(var(--primary))"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      
      <Card>
        <CardHeader>
          <CardTitle>Streak Calendar</CardTitle>
          <CardDescription>
            Your daily routine completion over the last {timeRange === "week" ? "7" : timeRange === "month" ? "30" : "365"} days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {dailyData.slice(-35).map((day, index) => {
              const completionRate = day.total > 0 ? (day.completed / day.total) * 100 : 0;

              let bgColor = "bg-gray-100 dark:bg-gray-800"; 
              if (day.total > 0) {
                if (completionRate >= 80) bgColor = "bg-green-500";
                else if (completionRate >= 60) bgColor = "bg-green-400";
                else if (completionRate >= 40) bgColor = "bg-green-300";
                else if (completionRate >= 20) bgColor = "bg-yellow-300";
                else bgColor = "bg-gray-300 dark:bg-gray-600";
              }
              
              return (
                <div
                  key={index}
                  className={`w-8 h-8 rounded-sm ${bgColor} flex items-center justify-center text-xs font-medium text-white`}
                  title={`${day.date}: ${day.completed}/${day.total} completed (${Math.round(completionRate)}%)`}
                >
                  {format(new Date(day.date), 'd')}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Less</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
            </div>
            <span>More</span>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}