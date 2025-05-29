import React, { useState } from 'react';
import { RoutineItem } from './RoutineItem';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChevronUp, ChevronDown, Clock } from 'lucide-react';
import type { Routine } from '@/lib/types';

interface RoutineGroupProps {
  group: {
    id: string;
    name: string;
    icon?: string;
    timeRange?: string;
    routines: Routine[];
  };
  onToggleCompletion: (id: string, completed: boolean) => void;
  isEditable?: boolean;
}

export function RoutineGroup({
  group,
  onToggleCompletion,
  isEditable = true,
}: RoutineGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const totalRoutines = group.routines.length;
  const completedRoutines = group.routines.filter((r) => r.completed).length;

  const completionPercentage =
    totalRoutines > 0
      ? Math.round((completedRoutines / totalRoutines) * 100)
      : 0;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex justify-between items-center focus:outline-none"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center">
            <CardTitle>{group.name}</CardTitle>
            {group.timeRange && (
              <div className="ml-4 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {group.timeRange}
              </div>
            )}
          </div>

          <div className="flex items-center">
            <div className="mr-4 text-sm">
              <span
                className={
                  completionPercentage === 100
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-blue-600 dark:text-blue-400'
                }
              >
                {completedRoutines}/{totalRoutines}
              </span>
              <span className="text-gray-500 dark:text-gray-400 ml-2">
                ({completionPercentage}%)
              </span>
            </div>

            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </button>

        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-3">
          <div
            className={`h-1.5 rounded-full ${
              completionPercentage === 100
                ? 'bg-green-500 dark:bg-green-400'
                : 'bg-blue-500 dark:bg-blue-400'
            }`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="space-y-3">
            {group.routines.map((routine) => (
              <RoutineItem
                key={routine.id}
                routine={routine}
                onToggleCompletion={onToggleCompletion}
                isEditable={isEditable}
              />
            ))}

            {group.routines.length === 0 && (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                No routines in this group yet
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
