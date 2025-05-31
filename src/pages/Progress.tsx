import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getCompletionsByDate,
  getCompletionsInRange,
  getUserRoutines,
  getWeekdaySchedule,
} from '@/lib/firebase';
import Layout from '@/components/Layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { eachDayOfInterval, format, subDays } from 'date-fns';
import type { Completion, DayKey, Routine } from '@/lib/types';
import { useI18n } from '@/contexts/I18nProvider';

const getColorClass = (percentage: number) => {
  if (percentage >= 80) return 'text-green-500';
  if (percentage >= 50) return 'text-amber-500';
  return 'text-red-500';
};

export default function ProgressPage() {
  const { t } = useI18n();
  const [timeRange, setTimeRange] = useState('week');
  const today = new Date();

  const getDateRange = () => {
    switch (timeRange) {
      case 'week':
        return { start: subDays(today, 6), end: today };
      case 'month':
        return { start: subDays(today, 29), end: today };
      case 'year':
        return { start: subDays(today, 364), end: today };
      default:
        return { start: subDays(today, 6), end: today };
    }
  };

  const dateRange = getDateRange();
  const todayString = format(today, 'yyyy-MM-dd');
  const { user } = useAuth();

  const { data: completionStats = [] } = useQuery<Completion[]>({
    queryKey: [
      'completionsRange',
      user?.uid,
      format(dateRange.start, 'yyyy-MM-dd'),
      format(dateRange.end, 'yyyy-MM-dd'),
    ],
    queryFn: () =>
      getCompletionsInRange(
        user!.uid,
        format(dateRange.start, 'yyyy-MM-dd'),
        format(dateRange.end, 'yyyy-MM-dd'),
      ),
    enabled: !!user,
  });

  const { data: userRoutines = [] } = useQuery<Routine[]>({
    queryKey: ['routines', user?.uid],
    queryFn: () => getUserRoutines(user!.uid),
    enabled: !!user,
  });

  const { data: weekdaySchedules = [] } = useQuery({
    queryKey: ['weekdaySchedules', user?.uid],
    queryFn: async () => {
      return Promise.all(
        userRoutines.map((routine) =>
          getWeekdaySchedule(routine.id).catch(() => ({
            id: '0',
            routineId: routine.id,
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true,
            sunday: true,
          })),
        ),
      );
    },
    enabled: userRoutines.length > 0,
  });

  const { data: todayCompletions = [] } = useQuery<Completion[]>({
    queryKey: ['completionsByDate', user?.uid, todayString],
    queryFn: () => getCompletionsByDate(user!.uid, todayString),
    enabled: !!user,
  });

  const weekdayMap: DayKey[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];

  const todayKey = weekdayMap[today.getDay()];
  const routinesForToday = userRoutines.filter((routine) => {
    const schedule = weekdaySchedules.find((s) => s.routineId === routine.id);
    const isScheduled = schedule?.[todayKey];
    const isArchived = routine.archived;
    const isArchivedToday = format(new Date(), 'yyyy-MM-dd') === todayString;
    return isScheduled && (!isArchived || isArchivedToday);
  });

  const dailyData = eachDayOfInterval({
    start: dateRange.start,
    end: dateRange.end,
  }).map((day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const weekdayKey = weekdayMap[day.getDay()];

    const routinesForDay = userRoutines.filter((routine) => {
      const schedule = weekdaySchedules.find((s) => s.routineId === routine.id);
      const isScheduled = schedule?.[weekdayKey];
      const isArchived = routine.archived;
      const isArchivedToday = format(new Date(), 'yyyy-MM-dd') === dayStr;
      return isScheduled && (!isArchived || isArchivedToday);
    });

    const completed = new Set(
      completionStats
        .filter((c) => format(new Date(c.completedAt), 'yyyy-MM-dd') === dayStr)
        .map((c) => c.routineId),
    ).size;

    const total = routinesForDay.length;
    const percentage =
      total > 0 ? Math.min(Math.round((completed / total) * 100), 100) : 0;

    return {
      date: format(day, 'MMM dd'),
      completed,
      total,
      percentage,
    };
  });

  // Ahora puedes usar routinesForToday en todas las métricas del día
  const totalCount = routinesForToday.length;
  const completedCount = todayCompletions.filter((c) =>
    routinesForToday.some((r) => r.id === c.routineId),
  ).length;
  const percentage =
    totalCount > 0
      ? Math.min(Math.round((completedCount / totalCount) * 100), 100)
      : 0;

  // Puedes usar routinesForToday en priorityData también
  const priorityData = ['high', 'medium', 'low'].map((priority) => {
    const filtered = routinesForToday.filter((r) => r.priority === priority);
    const expected = filtered.length || 1;
    const completed = new Set(
      todayCompletions
        .filter((c) => filtered.some((r) => r.id === c.routineId))
        .map((c) => c.routineId),
    ).size;

    return {
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      completed: Math.min(Math.round((completed / expected) * 100), 100),
    };
  });

  const routineStats = userRoutines.reduce(
    (acc, r) => {
      acc[r.id] = { completed: 0, total: dailyData.length, name: r.name };
      return acc;
    },
    {} as Record<string, { completed: number; total: number; name: string }>,
  );

  completionStats.forEach((c) => {
    if (routineStats[c.routineId]) routineStats[c.routineId].completed++;
  });

  const routineArray = Object.values(routineStats);
  const mostCompletedRoutine = routineArray.reduce(
    (max, r) => (r.completed / r.total > max.completed / max.total ? r : max),
    {
      completed: 0,
      total: 1,
      name: 'Ninguna',
    },
  );
  const leastCompletedRoutine = routineArray.reduce(
    (min, r) => (r.completed / r.total < min.completed / min.total ? r : min),
    {
      completed: Infinity,
      total: 1,
      name: 'Ninguna',
    },
  );

  const streak = dailyData
    .reverse()
    .reduce((acc, d) => (d.completed > 0 ? acc + 1 : 0), 0);

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('progress.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('progress.description')}
          </p>
        </div>

        <div className="mt-4 md:mt-0 w-full md:w-48">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger>
              <SelectValue placeholder={t('progress.rangePlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">{t('progress.rangeWeek')}</SelectItem>
              <SelectItem value="month">{t('progress.rangeMonth')}</SelectItem>
              <SelectItem value="year">{t('progress.rangeYear')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 mb-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t('progress.completionRate')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const weekdayKey = weekdayMap[today.getDay()];
              const routinesForToday = userRoutines.filter((routine) => {
                const schedule = weekdaySchedules.find(
                  (s) => s.routineId === routine.id,
                );
                const isScheduled = schedule?.[weekdayKey];
                const isArchived = routine.archived;
                const isArchivedToday =
                  format(new Date(), 'yyyy-MM-dd') === todayString;
                return isScheduled && (!isArchived || isArchivedToday);
              });
              const totalCount = routinesForToday.length;

              const completedCount = new Set(
                todayCompletions.map((c) => c.routineId),
              ).size;
              const percentage =
                totalCount > 0
                  ? Math.min(
                      Math.round((completedCount / totalCount) * 100),
                      100,
                    )
                  : 0;

              return (
                <>
                  <div
                    className={`text-3xl font-bold ${getColorClass(percentage)}`}
                  >
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
              {t('progress.streakCalendar')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {streak} {t('time.days')}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {t('progress.streakMessage')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t('progress.mostCompletedTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {mostCompletedRoutine.name}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {t('progress.mostCompletedStats', {
                completed: mostCompletedRoutine.completed,
                total: mostCompletedRoutine.total,
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t('progress.leastCompletedTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {leastCompletedRoutine.name}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {t('progress.leastCompletedStats', {
                completed: leastCompletedRoutine.completed,
                total: leastCompletedRoutine.total,
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('progress.dailyCompletion')}</CardTitle>
          <CardDescription>
            {t('progress.dailyCompletionDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[...dailyData].reverse()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Completion Rate']}
                />
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
          <CardTitle>{t('progress.completionByPriority')}</CardTitle>
          <CardDescription>
            {t('progress.completionByPriorityDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Completion Rate']}
                />
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
          <CardTitle>{t('progress.streakCalendar')}</CardTitle>
          <CardDescription>
            {t('progress.streakCalendarDescription', {
              days: timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {[...dailyData]
              .slice(-35)
              .reverse()
              .map((day, index) => {
                const completionRate =
                  day.total > 0 ? (day.completed / day.total) * 100 : 0;

                let bgColor = 'bg-gray-100 dark:bg-gray-800';
                if (day.total > 0) {
                  if (completionRate >= 80) bgColor = 'bg-green-500';
                  else if (completionRate >= 60) bgColor = 'bg-green-400';
                  else if (completionRate >= 40) bgColor = 'bg-green-300';
                  else if (completionRate >= 20) bgColor = 'bg-yellow-300';
                  else bgColor = 'bg-gray-300 dark:bg-gray-600';
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
