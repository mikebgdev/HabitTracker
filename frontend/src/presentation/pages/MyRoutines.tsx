import React, { useState } from "react";
import Layout from "@/presentation/components/Layout";
import { AddRoutineModal } from "@/presentation/components/AddRoutineModal";
import { EditRoutineModal } from "@/presentation/components/EditRoutineModal";
import { AssignGroupToRoutine } from "@/presentation/components/AssignGroupToRoutine";
import { Button } from "@/presentation/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { Badge } from "@/presentation/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash,
  Clock, 
  Flame,
  BatteryMedium,
  Timer,
  FolderOpen,
  FolderX,
  Archive,
  RotateCcw,
  Activity,
  Bike,
  Book,
  BrainCircuit,
  Coffee,
  Dumbbell,
  Footprints,
  HandPlatter,
  Heart,
  Laptop,
  Microscope,
  Music,
  Palette,
  Pen,
  Smartphone,
  Sparkles,
  Utensils,
  Waves,
  LucideIcon
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/infrastructure/api/queryClient";
import { queryClient } from "@/infrastructure/api/queryClient";
import { useToast } from "@/application/use-cases/use-toast";
import { DeleteRoutineDialog } from "@/presentation/components/dialogs/DeleteRoutineDialog";
import { WeekdayScheduleDisplay } from "@/presentation/components/WeekdayScheduleDisplay";
import type { Routine, Group, GroupRoutine } from "@shared/schema";

export default function MyRoutines() {
  const { toast } = useToast();
  const [isAddRoutineModalOpen, setIsAddRoutineModalOpen] = useState(false);
  const [isEditRoutineModalOpen, setIsEditRoutineModalOpen] = useState(false);
  const [isAssignGroupModalOpen, setIsAssignGroupModalOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"active" | "archived">("active");

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState<Routine | null>(null);
  const [routineToEdit, setRoutineToEdit] = useState<Routine | null>(null);

  const { data: routines = [], isLoading, refetch: refetchRoutines } = useQuery<Routine[]>({
    queryKey: ['/api/routines'],
  });

  const { data: groups = [], refetch: refetchGroups } = useQuery<Group[]>({
    queryKey: ['/api/groups'],
  });

  const confirmDeleteRoutine = (routine: Routine) => {
    setRoutineToDelete(routine);
    setIsDeleteDialogOpen(true);
  };

  const handleArchiveRoutine = async (routineId: number) => {
    try {
      await apiRequest("PATCH", `/api/routines/${routineId}/archive`, {});

      await refetchRoutines();
      
      toast({
        title: "Rutina archivada",
        description: "La rutina ha sido archivada correctamente y ya no aparecerá en rutinas futuras"
      });
    } catch (error) {
      console.error("Failed to archive routine:", error);
      toast({
        title: "Error",
        description: "No se pudo archivar la rutina. Inténtalo de nuevo."
      });
    }
  }

  const handleUnarchiveRoutine = async (routineId: number) => {
    try {
      await apiRequest("PATCH", `/api/routines/${routineId}/unarchive`, {});

      await refetchRoutines();
      
      toast({
        title: "Rutina desarchivada",
        description: "La rutina ha sido restaurada y volverá a aparecer en rutinas activas"
      });
    } catch (error) {
      console.error("Failed to unarchive routine:", error);
      toast({
        title: "Error",
        description: "No se pudo desarchivar la rutina. Inténtalo de nuevo."
      });
    }
  };

  const handleDeleteRoutine = async () => {
    if (!routineToDelete) return;
    
    try {
      await apiRequest("DELETE", `/api/routines/${routineToDelete.id}`, {});

      await refetchRoutines();
      await refetchGroups();
      
      toast({
        title: "Rutina eliminada",
        description: "La rutina ha sido eliminada correctamente"
      });
    } catch (error) {
      console.error("Failed to delete routine:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la rutina. Inténtalo de nuevo."
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setRoutineToDelete(null);
    }
  };

  const { data: groupRoutines = [] } = useQuery({
    queryKey: ['/api/group-routines']
  });

  const getRoutineGroupInfo = (routineId: number) => {

    if (!Array.isArray(groupRoutines)) return null;


    const assignment = groupRoutines.find((gr: any) => {
      return gr.routineId === routineId;
    });
    
    if (!assignment) {
      return null;
    }

    return {
      id: assignment.groupId,
      name: assignment.groupName,
      icon: assignment.groupIcon
    };
  };

  const filteredRoutines = routines.filter(routine => {

    if (viewMode === "active" && routine.archived) {
      return false;
    }
    if (viewMode === "archived" && !routine.archived) {
      return false;
    }

    if (filter !== "all" && routine.priority !== filter) {
      return false;
    }

    if (groupFilter !== "all") {

      const groupInfo = getRoutineGroupInfo(routine.id);
      if (!groupInfo || groupInfo.id !== parseInt(groupFilter)) {
        return false;
      }
    }
    
    return true;
  });

  const priorityIcons = {
    high: <Flame className="w-4 h-4 mr-1" />,
    medium: <BatteryMedium className="w-4 h-4 mr-1" />,
    low: <Timer className="w-4 h-4 mr-1" />
  };

  const priorityLabels = {
    high: 'Alta',
    medium: 'Media',
    low: 'Baja'
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
    waves: Waves
  };

  const renderRoutineIcon = (iconName: string | null) => {
    if (!iconName) return null;
    
    const IconComponent = iconMap[iconName];
    if (!IconComponent) return null;
    
    return <IconComponent className="w-5 h-5 mr-2 text-primary" />;
  };
  
  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default"; 
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };
  
  const formatTime = (timeString: string) => {
    if (!timeString) return '';

    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes || '00'} ${ampm}`;
    }

    return timeString;
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
      
      
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg w-fit">
          <button
            onClick={() => setViewMode("active")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === "active"
                ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Active Routines
          </button>
          <button
            onClick={() => setViewMode("archived")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === "archived"
                ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Archived Routines
          </button>
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
                  <div className="flex gap-3 items-start">
                    
                    <div className="w-10 h-10 flex items-center justify-center bg-primary-100 dark:bg-primary-800/30 rounded-full text-primary-700 dark:text-primary-300">
                      <Activity className="w-5 h-5" />
                    </div>
                    
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        {routine.name}
                      </CardTitle>
                      
                      
                      <div className="mt-1">
                        {getRoutineGroupInfo(routine.id) ? (
                          <Badge variant="outline" className="flex items-center text-xs gap-1">
                            <FolderOpen className="w-3 h-3" />
                            <span>{getRoutineGroupInfo(routine.id)?.name}</span>
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="flex items-center text-xs gap-1 text-gray-400 dark:text-gray-500">
                            <FolderOpen className="w-3 h-3 opacity-50" />
                            <span>Sin grupo</span>
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Badge variant={getPriorityBadgeVariant(routine.priority)} className="flex items-center gap-1">
                    {priorityIcons[routine.priority as keyof typeof priorityIcons]}
                    <span>{priorityLabels[routine.priority as keyof typeof priorityLabels]}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                
                
                
                <div className="mb-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-gray-400" />
                    Tiempo estimado
                  </div>
                  <div className="text-gray-900 dark:text-white font-medium">
                    {formatTime(routine.expectedTime)}
                  </div>
                </div>
                
                
                <WeekdayScheduleDisplay routineId={routine.id} />
                
                
                <div className="flex justify-end space-x-2 flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-700 dark:text-gray-300"
                    onClick={() => {

                      setRoutineToEdit(routine);
                      setIsEditRoutineModalOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Editar
                  </Button>
                  
                  {viewMode === "active" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                      onClick={() => handleArchiveRoutine(routine.id)}
                    >
                      <Archive className="h-4 w-4 mr-1" /> Archivar
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                      onClick={() => handleUnarchiveRoutine(routine.id)}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" /> Desarchivar
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 dark:text-red-400"
                    onClick={() => confirmDeleteRoutine(routine)}
                  >
                    <Trash className="h-4 w-4 mr-1" /> Eliminar
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
        onRoutineCreated={async () => {
          await refetchRoutines();
          await refetchGroups();
        }}
      />
      
      
      <DeleteRoutineDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteRoutine}
        routineName={routineToDelete?.name}
      />
      
      
      <EditRoutineModal
        isOpen={isEditRoutineModalOpen}
        onClose={() => {
          setIsEditRoutineModalOpen(false);
          setRoutineToEdit(null);
        }}
        routine={routineToEdit || undefined}
        onRoutineUpdated={async () => {
          await refetchRoutines();
          await refetchGroups();
        }}
      />
      
      
      <AssignGroupToRoutine
        isOpen={isAssignGroupModalOpen}
        onClose={() => {
          setIsAssignGroupModalOpen(false);
          setRoutineToEdit(null);
        }}
        routine={routineToEdit || undefined}
        onComplete={async () => {
          await refetchRoutines();

          await refetchGroups();

          await queryClient.invalidateQueries({ queryKey: ['/api/routines/group-assignments'] });
        }}
      />
    </Layout>
  );
}