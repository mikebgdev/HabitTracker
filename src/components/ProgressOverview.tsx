import { ProgressBar } from '@/components/ui/progress-bar';
import { motion } from 'framer-motion';
import type { Routine } from '@/lib/types';

interface ProgressOverviewProps {
  routines: (Routine & { completedAt?: string })[];
  streak?: number;
  totalGroups?: number;
  completedGroups?: number;
}

export function ProgressOverview({
  routines,
  streak = 0,
  totalGroups = 0,
  completedGroups = 0,
}: ProgressOverviewProps) {
  const totalRoutines = routines.length;
  const completedRoutines = routines.filter((r) => r.completedAt).length;
  const completionRate =
    totalRoutines > 0
      ? Math.round((completedRoutines / totalRoutines) * 100)
      : 0;

  const highPriorityRoutines = routines.filter((r) => r.priority === 'high');
  const completedHighPriority = highPriorityRoutines.filter(
    (r) => r.completedAt,
  ).length;

  const getProgressVariant = (percent: number) => {
    if (percent >= 80) return 'success';
    if (percent >= 50) return 'warning';
    return 'danger';
  };

  const variantColor = getProgressVariant(completionRate);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Daily Progress
        </h3>
        <div className="mt-2 md:mt-0 text-sm font-medium">
          <span className="text-gray-700 dark:text-gray-300">Completed:</span>
          <span className="text-green-600 dark:text-green-400 ml-1">
            {completedRoutines}/{totalRoutines} routines
          </span>
        </div>
      </div>

      <motion.div
        initial={{ width: '0%' }}
        animate={{ width: `${completionRate}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <ProgressBar
          value={completionRate}
          className="w-full h-4 mb-4"
          variant={variantColor}
        />
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Completion Rate
          </p>
          <p
            className={`text-2xl font-bold ${
              variantColor === 'success'
                ? 'text-green-500'
                : variantColor === 'warning'
                  ? 'text-amber-500'
                  : 'text-red-500'
            }`}
          >
            {completionRate}%
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Streak</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {streak} days
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Groups</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {completedGroups}/{totalGroups}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            High Priority
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {completedHighPriority}/{highPriorityRoutines.length}
          </p>
        </div>
      </div>
    </div>
  );
}
