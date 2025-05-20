import { useState } from "react";
import { RoutineItem } from "./RoutineItem";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import type { Group, Routine, Completion } from "@shared/schema";

interface RoutineGroupProps {
  group: Group;
  date: Date;
}

export function RoutineGroup({ group, date }: RoutineGroupProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Fetch routines for this group
  const { data: routines = [] } = useQuery<(Routine & { completedAt?: string })[]>({
    queryKey: ['/api/groups/routines', group.id, date.toISOString().split('T')[0]],
  });

  const completedCount = routines.filter(r => r.completedAt).length;
  const totalCount = routines.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const toggleGroup = () => {
    setIsOpen(!isOpen);
  };

  // Handle marking the entire group as complete
  const handleCompleteGroup = async () => {
    try {
      // Find all incomplete routines in the group
      const incompleteRoutines = routines.filter(r => !r.completedAt);
      
      if (incompleteRoutines.length === 0) return;
      
      // Complete all of them
      await apiRequest('POST', '/api/completions/group', { 
        groupId: group.id,
        date: date.toISOString().split('T')[0]
      });
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ 
        queryKey: ['/api/groups/routines', group.id] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['/api/routines/daily'] 
      });
    } catch (error) {
      console.error('Failed to complete group:', error);
    }
  };

  // Determine icon class based on group name or icon property
  const getIconClass = () => {
    if (group.icon) return group.icon;
    
    const name = group.name.toLowerCase();
    if (name.includes('morning')) return 'text-amber-500 fas fa-sun';
    if (name.includes('work')) return 'text-blue-500 fas fa-briefcase';
    if (name.includes('evening')) return 'text-purple-500 fas fa-moon';
    return 'text-primary fas fa-layer-group';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 overflow-hidden">
      <div 
        className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between cursor-pointer"
        onClick={toggleGroup}
      >
        <div className="flex items-center">
          <div className={`mr-3 text-xl ${getIconClass()}`}>
            <i className={getIconClass()}></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{group.name}</h3>
            {group.timeRange && (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <i className="fas fa-clock mr-1"></i>
                <span>{group.timeRange}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="mr-3 text-sm">
            <span className="font-medium text-green-600 dark:text-green-400">
              {completedCount}/{totalCount}
            </span>
          </div>
          <button className="text-gray-500">
            <ChevronDown className={cn(
              "transition-transform duration-200",
              !isOpen && "transform rotate-[-90deg]"
            )} />
          </button>
        </div>
      </div>
      
      {isOpen && (
        <div className="group-content">
          {routines.map((routine) => (
            <RoutineItem 
              key={routine.id} 
              routine={routine}
              date={date}
            />
          ))}

          {routines.length > 0 && routines.some(r => !r.completedAt) && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <button 
                onClick={handleCompleteGroup}
                className="w-full text-sm text-primary dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-500 flex items-center justify-center"
              >
                <i className="fas fa-check-circle mr-1"></i>
                Complete all remaining
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
