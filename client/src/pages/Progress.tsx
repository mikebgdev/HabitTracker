import { useState } from "react";
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
import type { Routine, Completion } from "@shared/schema";

// Helper function to get color class based on percentage
const getColorClass = (percentage: number) => {
  if (percentage >= 80) return "text-green-500";
  if (percentage >= 50) return "text-amber-500";
  return "text-red-500";
};

export default function ProgressPage() {
  const [timeRange, setTimeRange] = useState("week");
  const today = new Date();
  
  // Calculate date range based on selected time range
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
  
  // Fetch completion data for the selected date range
  const { data: completionStats = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/completions/stats', format(dateRange.start, 'yyyy-MM-dd'), format(dateRange.end, 'yyyy-MM-dd')],
  });
  
  // Fetch all user routines to calculate totals
  const { data: userRoutines = [] } = useQuery<Routine[]>({
    queryKey: ['/api/routines'],
  });
  
  // Fetch weekday schedules to know which routines should be completed on which days
  const { data: weekdaySchedules = [] } = useQuery<any[]>({
    queryKey: ['/api/routines/weekday-schedule'],
  });
  
  // Generate real data for the charts based on actual completions
  const generateDailyCompletionData = () => {
    const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
    
    return days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayOfWeek = day.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const weekdayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const currentDay = weekdayMap[dayOfWeek];
      
      // Find routines scheduled for this day
      const scheduledRoutines = userRoutines.filter(routine => {
        const schedule = weekdaySchedules.find((s: any) => s.routineId === routine.id);
        return schedule && schedule[currentDay];
      });
      
      // Find completions for this day
      const dayCompletions = completionStats.filter((completion: any) => 
        format(new Date(completion.completedAt), 'yyyy-MM-dd') === dayStr
      );
      
      const total = scheduledRoutines.length;
      const completed = dayCompletions.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return {
        date: format(day, "MMM dd"),
        completed,
        total,
        percentage
      };
    });
  };
  
  const dailyData = generateDailyCompletionData();
  
  // Generate data for each priority level based on actual routines and completions
  const generatePriorityData = () => {
    // Group routines by priority
    const routinesByPriority: Record<string, Routine[]> = {
      high: userRoutines.filter(r => r.priority === 'high'),
      medium: userRoutines.filter(r => r.priority === 'medium'),
      low: userRoutines.filter(r => r.priority === 'low')
    };
    
    // Count completions for each priority
    const result = [
      { 
        name: "High", 
        completed: completionStats.filter(c => 
          routinesByPriority.high.some(r => r.id === c.routineId)
        ).length,
        expected: routinesByPriority.high.length * dailyData.length || 1 // Avoid division by zero
      },
      { 
        name: "Medium", 
        completed: completionStats.filter(c => 
          routinesByPriority.medium.some(r => r.id === c.routineId)
        ).length,
        expected: routinesByPriority.medium.length * dailyData.length || 1
      },
      { 
        name: "Low", 
        completed: completionStats.filter(c => 
          routinesByPriority.low.some(r => r.id === c.routineId)
        ).length,
        expected: routinesByPriority.low.length * dailyData.length || 1
      }
    ];
    
    // Convert to percentages
    return result.map(item => ({
      ...item,
      completed: Math.round((item.completed / item.expected) * 100)
    }));
  };
  
  const priorityData = generatePriorityData();
  
  // Obtener las completadas para hoy directamente
  const todayString = format(new Date(), 'yyyy-MM-dd');
  
  // Consulta para obtener las completadas para hoy directamente
  const { data: todayCompletions = [] } = useQuery<Completion[]>({
    queryKey: ['/api/completions', todayString],
  });
  
  // Calculate overall stats based on actual data
  const calculateOverallStats = () => {
    // Cálculo directo basado en datos reales
    const totalRoutines = userRoutines.length;
    const completedRoutines = todayCompletions.length;
    const completionRate = totalRoutines > 0 ? Math.round((completedRoutines / totalRoutines) * 100) : 0;
    
    // Calculate streak
    let currentStreak = 0;
    // Sort days in reverse order (newest first)
    const sortedDays = [...dailyData].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Count consecutive days with at least one completion
    for (const day of sortedDays) {
      if (day.completed > 0) {
        currentStreak++;
      } else if (day.total > 0) { // Only break streak if there were routines to complete
        break;
      }
    }
    
    // Create temporary variable for counting completions
    const routineStats: Record<number, { completed: number, total: number, name: string }> = {};
    
    // Initialize counts
    userRoutines.forEach(routine => {
      routineStats[routine.id] = {
        completed: 0,
        total: dailyData.length, // Maximum possible completions
        name: routine.name
      };
    });
    
    // Count completions per routine
    completionStats.forEach((completion: any) => {
      if (routineStats[completion.routineId]) {
        routineStats[completion.routineId].completed++;
      }
    });
    
    // Find most and least completed
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
      routineStats // Include the stats for use in the component
    };
  };
  
  const calculatedStats = calculateOverallStats();
  
  // Extraer los valores necesarios para un uso más fácil
  const { 
    totalRoutines, 
    completedRoutines, 
    completionRate, 
    streak, 
    mostCompletedRoutine, 
    leastCompletedRoutine,
    routineStats
  } = calculatedStats;

  // Buscar información específica de las rutinas más y menos completadas
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
      
      {/* Overall stats */}
      <div className="grid gap-6 mb-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Tasa de Completado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getColorClass(completionRate)}`}>
              {completionRate}%
            </div>
            <ProgressBar value={completionRate} className="mt-2 h-2" />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {completedRoutines} de {totalRoutines} rutinas completadas
            </p>
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
      
      {/* Daily Completion Chart */}
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
      
      {/* Priority Completion Chart */}
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
      
      {/* Streak Calendar (simplified) */}
      <Card>
        <CardHeader>
          <CardTitle>Streak Calendar</CardTitle>
          <CardDescription>
            Your daily routine completion over the last {timeRange === "week" ? "7" : timeRange === "month" ? "30" : "365"} days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {dailyData.map((day, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {day.date}
                </div>
                <div 
                  className={`w-full aspect-square rounded-md flex items-center justify-center text-xs font-medium ${
                    day.percentage >= 80 
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" 
                      : day.percentage >= 50 
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" 
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  }`}
                >
                  {day.percentage}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}