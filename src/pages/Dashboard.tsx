import React, { useState } from 'react';
import { RoutineGroup } from '@/components/RoutineGroup';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { addDays, format, subDays } from 'date-fns';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  addCompletion,
  getCompletionsByDate,
  getUserGroups,
  getUserRoutines,
  getWeekdaySchedule,
  removeCompletion,
} from '@/lib/firebase';
import type { DayKey } from '@/lib/types';
import { useI18n } from '@/contexts/I18nProvider';
import { Timestamp } from 'firebase/firestore';

export default function Dashboard() {
  const [isAddRoutineModalOpen, setIsAddRoutineModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { t } = useI18n();

  const formattedDate = format(selectedDate, 'EEEE, MMMM d, yyyy');
  const dateParam = format(selectedDate, 'yyyy-MM-dd');

  const { data: userGroups = [] } = useQuery({
    queryKey: ['groups', user?.uid],
    queryFn: () => getUserGroups(user!.uid),
    enabled: !!user,
  });

  const { data: userRoutines = [] } = useQuery({
    queryKey: ['routines', user?.uid],
    queryFn: () => getUserRoutines(user!.uid),
    enabled: !!user,
  });

  const { data: weekdaySchedules = [] } = useQuery({
    queryKey: ['weekdaySchedules', user?.uid],
    queryFn: async () => {
      return Promise.all(
        userRoutines.map((routine) =>
          getWeekdaySchedule(routine.id, user!.uid).catch(() => ({
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

  const { data: completions = [] } = useQuery({
    queryKey: ['completions', user?.uid, dateParam],
    queryFn: () => getCompletionsByDate(user!.uid, dateParam),
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
      const currentDay = weekdayMap[selectedDate.getDay()] as DayKey;

      const routinesForToday = userRoutines.filter((routine) => {
        const schedule = weekdaySchedules.find(
          (s) => s.routineId === routine.id,
        );
        const allowArchived =
          format(selectedDate, 'yyyy-MM-dd') ===
          format(new Date(), 'yyyy-MM-dd');
        return (
          (allowArchived || !routine.archived) &&
          (schedule ? schedule[currentDay] : false)
        );
      });

      const routinesWithCompletion = routinesForToday.map((routine) => {
        const completed = completions.some(
          (c) =>
            c.routineId === routine.id &&
            format(new Date(c.completedAt), 'yyyy-MM-dd') === dateParam,
        );
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
        if (byPriority !== 0) return byPriority;
        const toMinutes = (t: string) => {
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
    mutationFn: async ({
      routineId,
      completed,
    }: {
      routineId: string;
      completed: boolean;
    }) => {
      if (!user) return;
      if (completed) {
        await addCompletion({
          userId: user.uid,
          routineId,
          completedAt: Timestamp.fromDate(new Date()),
        });
      } else {
        await removeCompletion(user.uid, routineId, dateParam);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines', 'daily'] });
      queryClient.invalidateQueries({ queryKey: ['completions', dateParam] });
      queryClient.invalidateQueries({
        queryKey: ['completions', user?.uid, dateParam],
      });
    },
  });

  const isToday = dateParam === format(new Date(), 'yyyy-MM-dd');

  const handleToggleCompletion = (id: string, completed: boolean) => {
    if (!isToday) return;
    toggleCompletionMutation.mutate({ routineId: id, completed });
  };

  const total = data?.reduce((sum, g) => sum + g.routines.length, 0) || 0;
  const done =
    data?.reduce(
      (sum, g) => sum + g.routines.filter((r) => r.completed).length,
      0,
    ) || 0;
  const percentage = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Layout>
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />{' '}
              {t('dashboard.previousDay')}
            </Button>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-medium">{formattedDate}</h2>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date())}
              >
                {t('dashboard.today')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              >
                {t('dashboard.nextDay')}{' '}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>{t('dashboard.dailyProgress')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-2">
            <div>
              <span className="text-3xl font-bold">
                {done}/{total}
              </span>
                <span className="ml-2 text-gray-500 dark:text-gray-400">
                  {t('dashboard.routinesCompletedLabel')}
                </span>
            </div>
            <div className="text-3xl font-bold">
              <span
                className={
                  percentage >= 75
                    ? 'text-green-600 dark:text-green-400'
                    : percentage >= 50
                      ? 'text-blue-600 dark:text-blue-400'
                      : percentage >= 25
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-red-600 dark:text-red-400'
                }
              >
                {percentage}%
              </span>
            </div>
          </div>
          <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div
              className={`h-4 rounded-full ${
                percentage >= 75
                  ? 'bg-green-500 dark:bg-green-400'
                  : percentage >= 50
                    ? 'bg-blue-500 dark:bg-blue-400'
                    : percentage >= 25
                      ? 'bg-yellow-500 dark:bg-yellow-400'
                      : 'bg-red-500 dark:bg-red-400'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>{t('dashboard.loading')}</p>
        </div>
      ) : isError ? (
        <div className="text-center py-8 text-red-600 dark:text-red-400">
          <p>{t('dashboard.errorLoading')}</p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" /> {t('dashboard.retry')}
          </Button>
        </div>
      ) : data?.length ? (
        data.map((group) => (
          <RoutineGroup
            key={group.id}
            group={group}
            onToggleCompletion={handleToggleCompletion}
            onBulkComplete={() =>
              group.routines
                .filter((r) => !r.completed)
                .forEach((r) => handleToggleCompletion(r.id, true))
            }
            isEditable={isToday}
          />
        ))
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-medium mb-2">
            {t('dashboard.noRoutinesTitle')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {t('dashboard.noRoutinesSubtitle')}
          </p>
          <Button onClick={() => setIsAddRoutineModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> {t('dashboard.addRoutine')}
          </Button>
        </div>
      )}
    </Layout>
  );
}
