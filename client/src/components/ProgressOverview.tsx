import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import type { Routine } from "@shared/schema";

interface ProgressOverviewProps {
  routines: (Routine & { completedAt?: string })[];
}

export function ProgressOverview({ routines }: ProgressOverviewProps) {
  const totalRoutines = routines.length;
  const completedRoutines = routines.filter(r => r.completedAt).length;
  const completionRate = totalRoutines > 0 ? Math.round((completedRoutines / totalRoutines) * 100) : 0;
  
  // Calculate streak (this would come from API in a real implementation)
  const streak = 7; // Placeholder value

  // Calculate the count of completed high priority routines
  const highPriorityRoutines = routines.filter(r => r.priority === "high");
  const completedHighPriority = highPriorityRoutines.filter(r => r.completedAt).length;
  
  // Group calculations
  // In a real implementation, we'd get this from an API
  const totalGroups = 4;
  const completedGroups = 3;

  const getProgressVariant = (percent: number) => {
    if (percent >= 80) return "success";
    if (percent >= 50) return "warning";
    return "danger";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Progress</h3>
        <div className="mt-2 md:mt-0 text-sm font-medium">
          <span className="text-gray-700 dark:text-gray-300">Completed:</span>
          <span className="text-green-600 dark:text-green-400 ml-1">
            {completedRoutines}/{totalRoutines} routines
          </span>
        </div>
      </div>
      
      <motion.div
        initial={{ width: "0%" }}
        animate={{ width: `${completionRate}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Progress 
          value={completionRate} 
          className="w-full h-4 mb-4" 
          variant={getProgressVariant(completionRate)}
        />
      </motion.div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Completion Rate</p>
          <p className={`text-2xl font-bold ${getProgressVariant(completionRate) === "success" ? "text-green-500" : getProgressVariant(completionRate) === "warning" ? "text-amber-500" : "text-red-500"}`}>
            {completionRate}%
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Streak</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{streak} days</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Groups</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedGroups}/{totalGroups}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-gray-500 dark:text-gray-400 text-sm">High Priority</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedHighPriority}/{highPriorityRoutines.length}</p>
        </div>
      </div>
    </div>
  );
}
