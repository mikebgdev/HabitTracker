import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNavbar } from "@/components/MobileNavbar";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { Edit, Plus, Trash } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import type { Routine, Group, InsertRoutine, InsertGroup } from "@shared/schema";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<"routines" | "groups">("routines");
  const [isEditRoutineModalOpen, setIsEditRoutineModalOpen] = useState(false);
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [routineFormState, setRoutineFormState] = useState<Partial<InsertRoutine> & { weekdays?: Record<string, boolean> }>({
    name: "",
    expectedTime: "",
    priority: "medium",
    weekdays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
  });
  const [groupFormState, setGroupFormState] = useState<Partial<InsertGroup>>({
    name: "",
    icon: "fa-layer-group",
    timeRange: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: routines = [], isLoading: isLoadingRoutines } = useQuery<Routine[]>({
    queryKey: ['/api/routines'],
  });

  const { data: groups = [], isLoading: isLoadingGroups } = useQuery<Group[]>({
    queryKey: ['/api/groups'],
  });

  const handleOpenEditRoutineModal = (routine: Routine | null = null) => {
    setEditingRoutine(routine);
    if (routine) {
      setRoutineFormState({
        name: routine.name,
        expectedTime: routine.expectedTime,
        priority: routine.priority,
        userId: routine.userId,
      });


    } else {
      setRoutineFormState({
        name: "",
        expectedTime: "",
        priority: "medium",
        weekdays: {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: false,
          sunday: false,
        },
      });
    }
    setIsEditRoutineModalOpen(true);
  };

  const handleOpenEditGroupModal = (group: Group | null = null) => {
    setEditingGroup(group);
    if (group) {
      setGroupFormState({
        name: group.name,
        icon: group.icon || "fa-layer-group",
        timeRange: group.timeRange || "",
        userId: group.userId,
      });
    } else {
      setGroupFormState({
        name: "",
        icon: "fa-layer-group",
        timeRange: "",
      });
    }
    setIsEditGroupModalOpen(true);
  };

  const handleSaveRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingRoutine) {

        await apiRequest("PATCH", `/api/routines/${editingRoutine.id}`, routineFormState);
      } else {

        await apiRequest("POST", "/api/routines", {
          ...routineFormState,
          userId: 1, 
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['/api/routines'] });
      setIsEditRoutineModalOpen(false);
    } catch (error) {
      console.error("Failed to save routine:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingGroup) {

        await apiRequest("PATCH", `/api/groups/${editingGroup.id}`, groupFormState);
      } else {

        await apiRequest("POST", "/api/groups", {
          ...groupFormState,
          userId: 1, 
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      setIsEditGroupModalOpen(false);
    } catch (error) {
      console.error("Failed to save group:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoutine = async (routineId: number) => {
    if (!confirm("Are you sure you want to delete this routine?")) return;

    try {
      await apiRequest("DELETE", `/api/routines/${routineId}`, {});
      await queryClient.invalidateQueries({ queryKey: ['/api/routines'] });
    } catch (error) {
      console.error("Failed to delete routine:", error);
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (!confirm("Are you sure you want to delete this group? All associated routines will be unlinked.")) return;

    try {
      await apiRequest("DELETE", `/api/groups/${groupId}`, {});
      await queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
    } catch (error) {
      console.error("Failed to delete group:", error);
    }
  };

  const toggleWeekday = (day: string) => {
    setRoutineFormState(prev => ({
      ...prev,
      weekdays: {
        ...prev.weekdays,
        [day]: !(prev.weekdays?.[day])
      }
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 dark:text-red-400";
      case "medium":
        return "text-amber-600 dark:text-amber-400";
      case "low":
        return "text-green-600 dark:text-green-400";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <MobileNavbar />
      
      <main className="flex-1 overflow-y-auto pb-mobile-nav md:pb-0">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your habits and routine groups
              </p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === "routines"
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
                onClick={() => setActiveTab("routines")}
              >
                Routines
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === "groups"
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
                onClick={() => setActiveTab("groups")}
              >
                Groups
              </button>
            </div>
            
            <div className="p-4">
              {activeTab === "routines" ? (
                <div>
                  <div className="flex justify-end mb-4">
                    <Button
                      onClick={() => handleOpenEditRoutineModal()}
                      className="flex items-center"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Routine
                    </Button>
                  </div>
                  
                  {isLoadingRoutines ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">Loading routines...</p>
                    </div>
                  ) : routines.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {routines.map((routine) => (
                            <TableRow key={routine.id}>
                              <TableCell className="font-medium">{routine.name}</TableCell>
                              <TableCell>{routine.expectedTime}</TableCell>
                              <TableCell>
                                <span className={getPriorityColor(routine.priority)}>
                                  {routine.priority.charAt(0).toUpperCase() + routine.priority.slice(1)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleOpenEditRoutineModal(routine)}
                                  >
                                    <Edit size={16} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteRoutine(routine.id)}
                                  >
                                    <Trash size={16} />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400 mb-4">No routines found</p>
                      <Button
                        onClick={() => handleOpenEditRoutineModal()}
                        className="flex items-center mx-auto"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add Your First Routine
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex justify-end mb-4">
                    <Button
                      onClick={() => handleOpenEditGroupModal()}
                      className="flex items-center"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Group
                    </Button>
                  </div>
                  
                  {isLoadingGroups ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">Loading groups...</p>
                    </div>
                  ) : groups.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Time Range</TableHead>
                            <TableHead>Icon</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {groups.map((group) => (
                            <TableRow key={group.id}>
                              <TableCell className="font-medium">{group.name}</TableCell>
                              <TableCell>{group.timeRange || "No time range set"}</TableCell>
                              <TableCell>
                                <i className={`fas ${group.icon || "fa-layer-group"} text-primary`}></i>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleOpenEditGroupModal(group)}
                                  >
                                    <Edit size={16} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteGroup(group.id)}
                                  >
                                    <Trash size={16} />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400 mb-4">No groups found</p>
                      <Button
                        onClick={() => handleOpenEditGroupModal()}
                        className="flex items-center mx-auto"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add Your First Group
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      
      <Dialog open={isEditRoutineModalOpen} onOpenChange={setIsEditRoutineModalOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingRoutine ? "Edit Routine" : "Add New Routine"}
            </DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400">
              {editingRoutine 
                ? "Modify the routine details below" 
                : "Fill in the details for your new routine"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSaveRoutine}>
            <div className="space-y-4 py-2">
              <div className="mb-4">
                <Label htmlFor="routine-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Routine Name
                </Label>
                <Input 
                  id="routine-name"
                  value={routineFormState.name}
                  onChange={e => setRoutineFormState({...routineFormState, name: e.target.value})}
                  placeholder="Enter routine name"
                  required
                />
              </div>
              
              <div className="mb-4">
                <Label htmlFor="routine-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expected Time
                </Label>
                <Input 
                  id="routine-time"
                  type="time"
                  value={routineFormState.expectedTime}
                  onChange={e => setRoutineFormState({...routineFormState, expectedTime: e.target.value})}
                  required
                />
              </div>
              
              <div className="mb-4">
                <Label htmlFor="routine-priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </Label>
                <Select 
                  value={routineFormState.priority} 
                  onValueChange={(val: "high" | "medium" | "low") => 
                    setRoutineFormState({...routineFormState, priority: val})
                  }
                >
                  <SelectTrigger id="routine-priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mb-4">
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Repeat
                </Label>
                <div className="grid grid-cols-7 gap-1">
                  <Toggle 
                    variant={routineFormState.weekdays?.sunday ? "selected" : "day"}
                    pressed={routineFormState.weekdays?.sunday}
                    onPressedChange={() => toggleWeekday("sunday")}
                    className="text-xs font-medium text-center"
                  >
                    S
                  </Toggle>
                  <Toggle 
                    variant={routineFormState.weekdays?.monday ? "selected" : "day"}
                    pressed={routineFormState.weekdays?.monday}
                    onPressedChange={() => toggleWeekday("monday")}
                    className="text-xs font-medium text-center"
                  >
                    M
                  </Toggle>
                  <Toggle 
                    variant={routineFormState.weekdays?.tuesday ? "selected" : "day"}
                    pressed={routineFormState.weekdays?.tuesday}
                    onPressedChange={() => toggleWeekday("tuesday")}
                    className="text-xs font-medium text-center"
                  >
                    T
                  </Toggle>
                  <Toggle 
                    variant={routineFormState.weekdays?.wednesday ? "selected" : "day"}
                    pressed={routineFormState.weekdays?.wednesday}
                    onPressedChange={() => toggleWeekday("wednesday")}
                    className="text-xs font-medium text-center"
                  >
                    W
                  </Toggle>
                  <Toggle 
                    variant={routineFormState.weekdays?.thursday ? "selected" : "day"}
                    pressed={routineFormState.weekdays?.thursday}
                    onPressedChange={() => toggleWeekday("thursday")}
                    className="text-xs font-medium text-center"
                  >
                    T
                  </Toggle>
                  <Toggle 
                    variant={routineFormState.weekdays?.friday ? "selected" : "day"}
                    pressed={routineFormState.weekdays?.friday}
                    onPressedChange={() => toggleWeekday("friday")}
                    className="text-xs font-medium text-center"
                  >
                    F
                  </Toggle>
                  <Toggle 
                    variant={routineFormState.weekdays?.saturday ? "selected" : "day"}
                    pressed={routineFormState.weekdays?.saturday}
                    onPressedChange={() => toggleWeekday("saturday")}
                    className="text-xs font-medium text-center"
                  >
                    S
                  </Toggle>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex justify-end space-x-3 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditRoutineModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Routine"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      
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
                <Label htmlFor="group-time-range" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time Range (optional)
                </Label>
                <Input 
                  id="group-time-range"
                  value={groupFormState.timeRange}
                  onChange={e => setGroupFormState({...groupFormState, timeRange: e.target.value})}
                  placeholder="e.g. 6:00 AM - 8:00 AM"
                />
              </div>
              
              <div className="mb-4">
                <Label htmlFor="group-icon" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Icon (Font Awesome class)
                </Label>
                <Select 
                  value={groupFormState.icon} 
                  onValueChange={(val: string) => 
                    setGroupFormState({...groupFormState, icon: val})
                  }
                >
                  <SelectTrigger id="group-icon">
                    <SelectValue placeholder="Select an icon" />
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
    </div>
  );
}
