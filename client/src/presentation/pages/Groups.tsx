import { useState, useEffect } from "react";
import Layout from "@/presentation/components/Layout";
import { Button } from "@/presentation/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/presentation/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/presentation/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/presentation/components/ui/alert-dialog";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { Plus, Edit, Trash, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/infrastructure/api/queryClient";
import { queryClient } from "@/infrastructure/api/queryClient";
import { useToast } from "@/application/use-cases/use-toast";
import type { Group, InsertGroup, GroupRoutine } from "@shared/schema";

export default function Groups() {
  const { toast } = useToast();
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [groupFormState, setGroupFormState] = useState<Partial<InsertGroup>>({
    name: "",
    icon: "fa-layer-group",
    timeRange: "",
  });
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [routineCountByGroup, setRoutineCountByGroup] = useState<Record<number, number>>({});

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<number | null>(null);

  const { data: groups = [], isLoading: isLoadingGroups, refetch: refetchGroups } = useQuery<Group[]>({
    queryKey: ['/api/groups'],
  });

  const { data: groupRoutines = [], isLoading: isLoadingGroupRoutines, refetch: refetchGroupRoutines } = useQuery<any[]>({
    queryKey: ['/api/group-routines'],
  });

  useEffect(() => {
    if (Array.isArray(groupRoutines) && groupRoutines.length > 0) {
      const counts: Record<number, number> = {};

      groupRoutines.forEach((gr: any) => {
        if (!counts[gr.groupId]) {
          counts[gr.groupId] = 0;
        }
        counts[gr.groupId]++;
      });
      
      setRoutineCountByGroup(counts);
    } else {
      setRoutineCountByGroup({});
    }
  }, [groupRoutines]);
  
  const handleOpenEditGroupModal = (group: Group | null = null) => {
    setEditingGroup(group);
    if (group) {
      setGroupFormState({
        name: group.name,
        icon: group.icon || "fa-layer-group",
        timeRange: group.timeRange || "",
      });

      if (group.timeRange) {
        const timeParts = group.timeRange.split(" - ");
        if (timeParts.length === 2) {

          const convertToMilitaryTime = (time: string) => {
            const [timePart, ampm] = time.split(" ");
            let [hours, minutes] = timePart.split(":");
            hours = parseInt(hours) === 12 ? "00" : hours;
            
            if (ampm === "PM" && parseInt(hours) < 12) {
              hours = (parseInt(hours) + 12).toString();
            }
            
            return `${hours.padStart(2, "0")}:${minutes}`;
          };
          
          setStartTime(convertToMilitaryTime(timeParts[0]));
          setEndTime(convertToMilitaryTime(timeParts[1]));
        }
      } else {

        setStartTime("08:00");
        setEndTime("09:00");
      }
    } else {
      setGroupFormState({
        name: "",
        icon: "fa-layer-group",
        timeRange: "",
      });
      setStartTime("08:00");
      setEndTime("09:00");
    }
    setIsEditGroupModalOpen(true);
  };

  const formatTimeFor12Hour = (time: string) => {
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };
  
  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formattedStartTime = formatTimeFor12Hour(startTime);
    const formattedEndTime = formatTimeFor12Hour(endTime);
    const timeRange = `${formattedStartTime} - ${formattedEndTime}`;

    try {
      const dataToSend = {
        ...groupFormState,
        timeRange,
      };
      
      if (editingGroup) {

        await apiRequest("PATCH", `/api/groups/${editingGroup.id}`, dataToSend);
      } else {

        await apiRequest("POST", "/api/groups", {
          ...dataToSend,
          userId: 1, 
        });
      }

      await refetchGroups();
      await refetchGroupRoutines();
      setIsEditGroupModalOpen(false);
    } catch (error) {
      console.error("Failed to save group:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteGroup = (groupId: number) => {
    setGroupToDelete(groupId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;
    
    try {
      await apiRequest("DELETE", `/api/groups/${groupToDelete}`, {});

      await refetchGroups();
      await refetchGroupRoutines();
      
      toast({
        title: "Grupo eliminado",
        description: "El grupo ha sido eliminado correctamente"
      });
    } catch (error) {
      console.error("Failed to delete group:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el grupo. Inténtalo de nuevo."
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setGroupToDelete(null);
    }
  };
  
  const getIconClass = (iconName: string | null) => {
    if (!iconName) return "text-primary fas fa-layer-group";
    
    switch (iconName) {
      case "fa-sun":
        return "text-amber-500 fas fa-sun";
      case "fa-briefcase":
        return "text-blue-500 fas fa-briefcase";
      case "fa-moon":
        return "text-purple-500 fas fa-moon";
      case "fa-dumbbell":
        return "text-red-500 fas fa-dumbbell";
      case "fa-book":
        return "text-green-500 fas fa-book";
      default:
        return `text-primary fas ${iconName}`;
    }
  };

  const isLoading = isLoadingGroups || isLoadingGroupRoutines;

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Routine Groups</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Organize your routines into logical groups
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            onClick={() => handleOpenEditGroupModal()}
            className="flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Group
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Loading groups...</p>
        </div>
      ) : groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card key={group.id} className="overflow-hidden">
              <CardHeader className="p-4">
                <div className="flex items-center mb-2">
                  <div className="mr-3 text-xl">
                    <i className={getIconClass(group.icon)}></i>
                  </div>
                  <CardTitle className="text-lg font-semibold">
                    {group.name}
                  </CardTitle>
                </div>
                {group.timeRange && (
                  <CardDescription>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{group.timeRange}</span>
                    </div>
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Routines in this group:
                </div>
                <div className="text-gray-900 dark:text-white">
                  <span className="font-medium">
                    {routineCountByGroup[group.id] || 0} routine{routineCountByGroup[group.id] !== 1 ? 's' : ''}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2 p-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-700 dark:text-gray-300"
                  onClick={() => handleOpenEditGroupModal(group)}
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 dark:text-red-400"
                  onClick={() => confirmDeleteGroup(group.id)}
                >
                  <Trash className="h-4 w-4 mr-1" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No groups found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            You haven't created any groups yet. Groups help you organize your routines.
          </p>
          <Button 
            onClick={() => handleOpenEditGroupModal()}
          >
            Create Your First Group
          </Button>
        </div>
      )}
      
      
      <div className="fixed bottom-20 right-4 md:hidden">
        <Button 
          onClick={() => handleOpenEditGroupModal()}
          className="rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
          size="icon"
        >
          <Plus size={24} />
        </Button>
      </div>
      
      
      <Dialog open={isEditGroupModalOpen} onOpenChange={setIsEditGroupModalOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingGroup ? "Edit Group" : "Add New Group"}
            </DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400">
              {editingGroup 
                ? "Modify the group details below" 
                : "Fill in the details for your new group"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSaveGroup}>
            <div className="space-y-4 py-2">
              <div className="mb-4">
                <Label htmlFor="group-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Group Name
                </Label>
                <Input 
                  id="group-name"
                  value={groupFormState.name}
                  onChange={e => setGroupFormState({...groupFormState, name: e.target.value})}
                  placeholder="Enter group name"
                  required
                />
              </div>
              
              <div className="mb-4">
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time Range
                </Label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <Label htmlFor="start-time" className="text-xs mb-1 block">Start Time</Label>
                    <Input 
                      id="start-time"
                      type="time"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      required
                    />
                  </div>
                  <span className="text-gray-500 dark:text-gray-400 mt-6">to</span>
                  <div className="flex-1">
                    <Label htmlFor="end-time" className="text-xs mb-1 block">End Time</Label>
                    <Input 
                      id="end-time"
                      type="time"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Preview: {formatTimeFor12Hour(startTime)} - {formatTimeFor12Hour(endTime)}
                </p>
              </div>
              
              <div className="mb-4">
                <Label htmlFor="group-icon" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Icon
                </Label>
                <Select 
                  value={groupFormState.icon || "fa-layer-group"}
                  onValueChange={(val: string) => 
                    setGroupFormState({...groupFormState, icon: val})
                  }
                >
                  <SelectTrigger id="group-icon">
                    <div className="flex items-center">
                      <i className={getIconClass(groupFormState.icon)} style={{marginRight: '8px'}}></i>
                      <span>{
                        groupFormState.icon === 'fa-layer-group' ? 'General' :
                        groupFormState.icon === 'fa-sun' ? 'Morning' : 
                        groupFormState.icon === 'fa-briefcase' ? 'Work' :
                        groupFormState.icon === 'fa-moon' ? 'Evening' :
                        groupFormState.icon === 'fa-dumbbell' ? 'Fitness' :
                        groupFormState.icon === 'fa-book' ? 'Study' : 'Select an icon'
                      }</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fa-sun">
                      <div className="flex items-center">
                        <i className="fas fa-sun mr-2 text-amber-500"></i> 
                        <span>Morning</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="fa-briefcase">
                      <div className="flex items-center">
                        <i className="fas fa-briefcase mr-2 text-blue-500"></i> 
                        <span>Work</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="fa-moon">
                      <div className="flex items-center">
                        <i className="fas fa-moon mr-2 text-purple-500"></i> 
                        <span>Evening</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="fa-dumbbell">
                      <div className="flex items-center">
                        <i className="fas fa-dumbbell mr-2 text-red-500"></i> 
                        <span>Fitness</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="fa-book">
                      <div className="flex items-center">
                        <i className="fas fa-book mr-2 text-green-500"></i> 
                        <span>Study</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="fa-layer-group">
                      <div className="flex items-center">
                        <i className="fas fa-layer-group mr-2 text-gray-500"></i> 
                        <span>General</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter className="flex justify-end space-x-3 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditGroupModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Group"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente este grupo.
              Las rutinas asociadas no se eliminarán, pero ya no estarán vinculadas a este grupo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteGroup}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}