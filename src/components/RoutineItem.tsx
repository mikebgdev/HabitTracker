import React from 'react';
import {
  Activity,
  AlertTriangle,
  BatteryMedium,
  Bike,
  Book,
  BrainCircuit,
  CircleCheckBig,
  Clock,
  Coffee,
  Dumbbell,
  Flame,
  Footprints,
  HandPlatter,
  Heart,
  Laptop,
  LucideIcon,
  Microscope,
  Music,
  Palette,
  Pen,
  Smartphone,
  Sparkles,
  Timer,
  Utensils,
  Waves,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { formatTime } from '@/lib/date';
import { useQuery } from '@tanstack/react-query';
import { getUserGroups } from '@/lib/firebase';
import type { Group, Routine } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nProvider';

interface RoutineItemProps {
  routine: Routine & {
    completed?: boolean;
    completedAt?: string;
  };
  onToggleCompletion: (id: string, completed: boolean) => void;
  isEditable?: boolean;
}

export function RoutineItem({
  routine,
  onToggleCompletion,
  isEditable = true,
}: RoutineItemProps) {
  const { user } = useAuth();
  const { t } = useI18n();

  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ['groups'],
    queryFn: () => getUserGroups(user?.uid || ''),
    enabled: !!user,
  });

  const group = groups.find((g) => g.id === routine.groupId);

  const priorityLabels = {
    high: t('routines.high'),
    medium: t('routines.medium'),
    low: t('routines.low'),
  };

  const priorityIcons = {
    high: <Flame className="w-4 h-4" />,
    medium: <BatteryMedium className="w-4 h-4" />,
    low: <Timer className="w-4 h-4" />,
  };

  const iconMap: Record<string, LucideIcon> = {
    activity: Activity,
    bike: Bike,
    book: Book,
    brain: BrainCircuit,
    coffee: Coffee,
    dumbbell: Dumbbell,
    footprints: Footprints,
    food: HandPlatter,
    heart: Heart,
    laptop: Laptop,
    microscope: Microscope,
    music: Music,
    palette: Palette,
    pen: Pen,
    phone: Smartphone,
    sparkles: Sparkles,
    utensils: Utensils,
    waves: Waves,
  };

  const handleChange = () => {
    if (isEditable) {
      onToggleCompletion(routine.id, !routine.completed);
    }
  };

  const renderRoutineIcon = () => {
    if (!routine.icon) return null;
    const IconComponent = iconMap[routine.icon];
    return IconComponent ? (
      <IconComponent className="w-5 h-5 mr-2 text-primary" />
    ) : null;
  };

  return (
    <Card
      className={`mb-3 hover:shadow transition-all ${
        routine.completed ? 'bg-gray-50 dark:bg-gray-800 opacity-70' : ''
      }`}
    >
      <div className="p-4 flex items-center">
        <div className="mr-3">
          <Checkbox
            checked={!!routine.completed}
            onCheckedChange={(checked) => {
              if (typeof checked === 'boolean') {
                onToggleCompletion(routine.id, checked);
              }
            }}
            className="h-5 w-5"
            disabled={!isEditable}
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center flex-wrap gap-2">
            <div className="flex items-center mr-1">
              {renderRoutineIcon()}
              <h3
                className={`font-medium ${routine.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}
              >
                {routine.name}
              </h3>
            </div>

            <Badge
              variant="outline"
              className={`flex items-center px-2 py-0.5 text-xs ${
                routine.priority === 'high'
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                  : routine.priority === 'medium'
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
              }`}
            >
              {priorityIcons[routine.priority]}
              <span className="ml-1 font-medium">
                {priorityLabels[routine.priority]}
              </span>
            </Badge>
          </div>

          <div className="flex flex-wrap items-center mt-2 text-sm text-gray-600 dark:text-gray-400 gap-3">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
              <span>
                {t('routines.expectedTime')}: {formatTime(routine.expectedTime)}
              </span>
            </div>

            {routine.completed ? (
              <div className="flex items-center text-green-600 dark:text-green-400">
                <CircleCheckBig className="w-4 h-4 mr-1" />
                <span>
                  {routine.completedAt
                    ? t('routines.completedAt', {
                        time: formatTime(routine.completedAt),
                      })
                    : t('routines.completed')}
                </span>
              </div>
            ) : (
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <AlertTriangle className="w-4 h-4 mr-1" />
                <span>{t('routines.pending')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
