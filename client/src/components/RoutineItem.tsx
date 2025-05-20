import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { motion } from "framer-motion";
import type { Routine } from "@shared/schema";

interface RoutineItemProps {
  routine: Routine & { 
    completedAt?: string 
  };
  date: Date;
}

export function RoutineItem({ routine, date }: RoutineItemProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(!!routine.completedAt);

  const priorityVariants: Record<string, string> = {
    high: "high",
    medium: "medium",
    low: "low"
  };

  const handleToggleCompletion = async () => {
    setIsSubmitting(true);
    try {
      if (!isCompleted) {
        // Complete the routine
        await apiRequest("POST", "/api/completions", {
          routineId: routine.id,
          date: date.toISOString().split("T")[0]
        });
        setIsCompleted(true);
      } else {
        // Uncomplete the routine
        await apiRequest("DELETE", `/api/completions`, {
          routineId: routine.id,
          date: date.toISOString().split("T")[0]
        });
        setIsCompleted(false);
      }
      
      // Invalidate relevant queries to refresh data
      await queryClient.invalidateQueries({ 
        queryKey: ['/api/routines/daily'] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['/api/groups/routines'] 
      });
    } catch (error) {
      console.error("Failed to toggle completion:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (timeString: string) => {
    // Convert 24-hour format to 12-hour with AM/PM
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const completedTime = routine.completedAt 
    ? new Date(routine.completedAt)
    : null;

  const formattedTime = routine.expectedTime 
    ? formatTime(routine.expectedTime)
    : "No time set";

  return (
    <motion.div 
      className={`p-4 ${isCompleted ? 'bg-gray-50 dark:bg-gray-800/50' : ''} border-b border-gray-200 dark:border-gray-700 flex items-center justify-between`}
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 10 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center">
        <div className="mr-3">
          <Checkbox 
            checked={isCompleted}
            onCheckedChange={handleToggleCompletion}
            disabled={isSubmitting}
            className={`w-5 h-5 ${isCompleted ? 'animate-checkmark' : ''}`}
          />
        </div>
        <div>
          <h4 className={`text-base font-medium text-gray-900 dark:text-white ${isCompleted ? 'line-through' : ''}`}>
            {routine.name}
          </h4>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            {isCompleted && completedTime ? (
              <span>Completed at {format(completedTime, 'h:mm a')}</span>
            ) : (
              <>
                <i className="fas fa-clock mr-1"></i>
                <span>Expected at {formattedTime}</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center">
        <Badge variant={priorityVariants[routine.priority]}>
          {routine.priority.charAt(0).toUpperCase() + routine.priority.slice(1)}
        </Badge>
      </div>
    </motion.div>
  );
}
