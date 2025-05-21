import { useState } from "react";
import Layout from "@/components/Layout";
import { AddRoutineModal } from "@/components/AddRoutineModal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import type { Routine, Group } from "@shared/schema";

export default function MyRoutines() {
  const [isAddRoutineModalOpen, setIsAddRoutineModalOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  
  // Fetch all routines
  const { data: routines = [], isLoading } = useQuery<Routine[]>({
    queryKey: ['/api/routines'],
  });
  
  // Fetch all groups
  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ['/api/groups'],
  });
  
  const handleDeleteRoutine = async (routineId: number) => {
    if (!confirm("Are you sure you want to delete this routine?")) return;

    try {
      await apiRequest("DELETE", `/api/routines/${routineId}`, {});
      await queryClient.invalidateQueries({ queryKey: ['/api/routines'] });
    } catch (error) {
      console.error("Failed to delete routine:", error);
    }
  };
  
  // Filter routines based on current filters
  const filteredRoutines = routines.filter(routine => {
    // Filter by priority
    if (filter !== "all" && routine.priority !== filter) {
      return false;
    }
    
    // Filter by group
    if (groupFilter !== "all") {
      // In a real implementation, we would check if the routine belongs to the selected group
      // For this demo, we'll just assume that each routine has a groupId field
      return true; // Placeholder - would actually filter by group
    }
    
    return true;
  });
  
  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "high":
        return "high";
      case "medium":
        return "medium";
      case "low":
        return "low";
      default:
        return "default";
    }
  };
  
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Routines</h2>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all your routines
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Button 
            onClick={() => setIsAddRoutineModalOpen(true)}
            className="flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Routine
          </Button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Priority
            </label>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Group
            </label>
            <Select value={groupFilter} onValueChange={setGroupFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                {groups.map(group => (
                  <SelectItem key={group.id} value={group.id.toString()}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Loading routines...</p>
        </div>
      ) : filteredRoutines.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoutines.map((routine) => (
            <Card key={routine.id} className="overflow-hidden">
              <CardHeader className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold">
                    {routine.name}
                  </CardTitle>
                  <Badge variant={getPriorityBadgeVariant(routine.priority)}>
                    {routine.priority.charAt(0).toUpperCase() + routine.priority.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="mb-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Expected Time</div>
                  <div className="text-gray-900 dark:text-white font-medium">
                    {formatTime(routine.expectedTime)}
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Schedule</div>
                  <div className="flex flex-wrap gap-1">
                    <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs px-2 py-1 rounded">M</span>
                    <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs px-2 py-1 rounded">T</span>
                    <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs px-2 py-1 rounded">W</span>
                    <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs px-2 py-1 rounded">T</span>
                    <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs px-2 py-1 rounded">F</span>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded">S</span>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded">S</span>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-700 dark:text-gray-300"
                    onClick={() => {
                      // In a real app, this would open an edit modal
                      // For this demo, we'll reuse the AddRoutineModal
                      setIsAddRoutineModalOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 dark:text-red-400"
                    onClick={() => handleDeleteRoutine(routine.id)}
                  >
                    <Trash className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No routines found</h3>
          {filter !== "all" || groupFilter !== "all" ? (
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Try changing your filter criteria to see more routines.
            </p>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              You haven't created any routines yet. Get started by adding your first routine.
            </p>
          )}
          <Button 
            onClick={() => setIsAddRoutineModalOpen(true)}
          >
            Add Your First Routine
          </Button>
        </div>
      )}
      
      {/* Add new routine button (mobile only) */}
      <div className="fixed bottom-20 right-4 md:hidden">
        <Button 
          onClick={() => setIsAddRoutineModalOpen(true)}
          className="rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
          size="icon"
        >
          <Plus size={24} />
        </Button>
      </div>
      
      <AddRoutineModal 
        isOpen={isAddRoutineModalOpen}
        onClose={() => setIsAddRoutineModalOpen(false)}
      />
    </Layout>
  );
}