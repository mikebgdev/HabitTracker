import React, { useState } from "react";
import Layout from "@/components/Layout";
import { AddRoutineModal } from "@/components/AddRoutineModal";
import { EditRoutineModal } from "@/components/EditRoutineModal";
import { AssignGroupToRoutine } from "@/components/AssignGroupToRoutine";
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
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DeleteRoutineDialog } from "@/components/dialogs/DeleteRoutineDialog";
import { WeekdayScheduleDisplay } from "@/components/WeekdayScheduleDisplay";
import type { Routine, Group, GroupRoutine } from "@shared/schema";

export default function MyRoutines() {
  const { toast } = useToast();
  const [isAddRoutineModalOpen, setIsAddRoutineModalOpen] = useState(false);
  const [isEditRoutineModalOpen, setIsEditRoutineModalOpen] = useState(false);
  const [isAssignGroupModalOpen, setIsAssignGroupModalOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"active" | "archived">("active");
  
  // Estado para el diálogo de confirmación de eliminación
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState<Routine | null>(null);
  const [routineToEdit, setRoutineToEdit] = useState<Routine | null>(null);
  
  // Fetch all routines
  const { data: routines = [], isLoading, refetch: refetchRoutines } = useQuery<Routine[]>({
    queryKey: ['/api/routines'],
  });
  
  // Fetch all groups
  const { data: groups = [], refetch: refetchGroups } = useQuery<Group[]>({
    queryKey: ['/api/groups'],
  });
  
  // Mostrar diálogo de confirmación antes de eliminar
  const confirmDeleteRoutine = (routine: Routine) => {
    setRoutineToDelete(routine);
    setIsDeleteDialogOpen(true);
  };
  
  // Archivar rutina
  const handleArchiveRoutine = async (routineId: number) => {
    try {
      await apiRequest("PATCH", `/api/routines/${routineId}/archive`, {});
      
      // Actualizar consultas para reflejar el cambio
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
  };

  // Proceder con la eliminación después de confirmar
  const handleDeleteRoutine = async () => {
    if (!routineToDelete) return;
    
    try {
      await apiRequest("DELETE", `/api/routines/${routineToDelete.id}`, {});
      
      // Actualizar consultas para asegurar que la UI se actualice
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
  
  // Obtener información de grupos y asociaciones de rutinas con grupos
  const { data: groupRoutines = [] } = useQuery({
    queryKey: ['/api/group-routines']
  });
  
  // Función para obtener el grupo al que pertenece una rutina
  const getRoutineGroupInfo = (routineId: number) => {
    // Verificar que tengamos datos válidos
    if (!Array.isArray(groupRoutines)) return null;
    
    // Imprimir los datos para depuración
    console.log("Group Routines:", groupRoutines);
    console.log("Looking for routine ID:", routineId);
    
    // Buscar la asignación de grupo para esta rutina
    const assignment = groupRoutines.find((gr: any) => {
      console.log("Checking group routine:", gr);
      return gr.routineId === routineId;
    });
    
    if (!assignment) {
      console.log("No group assignment found for routine:", routineId);
      return null;
    }
    
    console.log("Found group assignment:", assignment);
    
    // Devolver la información del grupo directamente desde la asignación
    return {
      id: assignment.groupId,
      name: assignment.groupName,
      icon: assignment.groupIcon
    };
  };
  
  // Filter routines based on current filters and view mode
  const filteredRoutines = routines.filter(routine => {
    // Filter by view mode (active vs archived)
    if (viewMode === "active" && routine.archived) {
      return false;
    }
    if (viewMode === "archived" && !routine.archived) {
      return false;
    }
    
    // Filter by priority
    if (filter !== "all" && routine.priority !== filter) {
      return false;
    }
    
    // Filter by group
    if (groupFilter !== "all") {
      // Verificar si la rutina pertenece al grupo seleccionado
      const groupInfo = getRoutineGroupInfo(routine.id);
      if (!groupInfo || groupInfo.id !== parseInt(groupFilter)) {
        return false;
      }
    }
    
    return true;
  });
  
  // Iconos de prioridad
  const priorityIcons = {
    high: <Flame className="w-4 h-4 mr-1" />,
    medium: <BatteryMedium className="w-4 h-4 mr-1" />,
    low: <Timer className="w-4 h-4 mr-1" />
  };
  
  // Etiquetas de prioridad
  const priorityLabels = {
    high: 'Alta',
    medium: 'Media',
    low: 'Baja'
  };
  
  // Mapa de nombres de iconos a componentes de Lucide
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
  
  // Función para renderizar el icono personalizado de la rutina
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
        return "default"; // Usamos default en lugar de warning ya que warning no está definido
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };
  
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    
    // Manejar formato HH:MM
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes || '00'} ${ampm}`;
    }
    
    // Manejar formato de solo horas con AM/PM
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
      
      {/* View Mode Tabs */}
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
                    {/* Icono de la rutina */}
                    <div className="w-10 h-10 flex items-center justify-center bg-primary-100 dark:bg-primary-800/30 rounded-full text-primary-700 dark:text-primary-300">
                      <Activity className="w-5 h-5" />
                    </div>
                    
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        {routine.name}
                      </CardTitle>
                      
                      {/* Grupo al que pertenece */}
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
                {/* Ya mostramos el grupo en el encabezado */}
                
                {/* Tiempo esperado */}
                <div className="mb-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-gray-400" />
                    Tiempo estimado
                  </div>
                  <div className="text-gray-900 dark:text-white font-medium">
                    {formatTime(routine.expectedTime)}
                  </div>
                </div>
                
                {/* Programación semanal */}
                <WeekdayScheduleDisplay routineId={routine.id} />
                
                
                <div className="flex justify-end space-x-2 flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-700 dark:text-gray-300"
                    onClick={() => {
                      // Abrir el modal de edición y establecer la rutina a editar
                      setRoutineToEdit(routine);
                      setIsEditRoutineModalOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    onClick={() => handleArchiveRoutine(routine.id)}
                  >
                    <Archive className="h-4 w-4 mr-1" /> Archivar
                  </Button>
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
        onRoutineCreated={async () => {
          await refetchRoutines();
          await refetchGroups();
        }}
      />
      
      {/* Diálogo de confirmación para eliminar rutina */}
      <DeleteRoutineDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteRoutine}
        routineName={routineToDelete?.name}
      />
      
      {/* Modal de edición de rutina */}
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
      
      {/* Modal para asignar grupo a rutina */}
      <AssignGroupToRoutine
        isOpen={isAssignGroupModalOpen}
        onClose={() => {
          setIsAssignGroupModalOpen(false);
          setRoutineToEdit(null);
        }}
        routine={routineToEdit || undefined}
        onComplete={async () => {
          await refetchRoutines();
          // Refrescar los datos de grupo
          await refetchGroups();
          // Refrescar las asignaciones rutina-grupo
          await queryClient.invalidateQueries({ queryKey: ['/api/routines/group-assignments'] });
        }}
      />
    </Layout>
  );
}