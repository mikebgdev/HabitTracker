import React from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { formatTime } from '@/lib/date';
import type { Routine } from '@/lib/types';
import { useI18n } from '@/contexts/I18nProvider';
import { PRIORITY_ICONS, ROUTINE_ICON_MAP } from '@/lib/constants';
import { AlertTriangle, CircleCheckBig, Clock } from 'lucide-react';

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
  const { t } = useI18n();
  const { icon: PriorityIcon, badge: badgeClasses } =
    PRIORITY_ICONS[routine.priority];
  const RoutineIcon = routine.icon ? ROUTINE_ICON_MAP[routine.icon] : null;

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
              {RoutineIcon && (
                <RoutineIcon className="w-5 h-5 mr-2 text-primary" />
              )}
              <h3
                className={`font-medium ${
                  routine.completed
                    ? 'line-through text-gray-500 dark:text-gray-400'
                    : ''
                }`}
              >
                {routine.name}
              </h3>
            </div>

            <Badge
              variant="outline"
              className={`flex items-center gap-1 text-xs font-medium border ${badgeClasses}`}
            >
              <PriorityIcon className="h-4 w-4" />
              {t(`routines.${routine.priority}`)}
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
