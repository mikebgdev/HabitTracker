import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNavbar } from "@/components/MobileNavbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import type { Group, InsertGroup } from "@shared/schema";

export default function Groups() {
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [groupFormState, setGroupFormState] = useState<Partial<InsertGroup>>({
    name: "",
    icon: "fa-layer-group",
    timeRange: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch all groups
  const { data: groups = [], isLoading } = useQuery<Group[]>({
    queryKey: ['/api/groups'],
  });
  
  const handleOpenEditGroupModal = (group: Group | null = null) => {
    setEditingGroup(group);
    if (group) {
      setGroupFormState({
        name: group.name,
        icon: group.icon || "fa-layer-group",
        timeRange: group.timeRange || "",
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
  
  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingGroup) {
        // Update existing group
        await apiRequest("PATCH", `/api/groups/${editingGroup.id}`, groupFormState);
      } else {
        // Create new group
        await apiRequest("POST", "/api/groups", {
          ...groupFormState,
          userId: 1, // In a real app, this would come from auth context
        });
      }

      // Refresh data
      await queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      setIsEditGroupModalOpen(false);
    } catch (error) {
      console.error("Failed to save group:", error);
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <MobileNavbar />
      
      <main className="flex-1 overflow-y-auto pb-mobile-nav md:pb-0">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Routine Groups</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Organize your routines by creating groups
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
                          <i className="fas fa-clock mr-1"></i>
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
                      {/* In a real implementation, we would show the count of routines in this group */}
                      <span className="font-medium">5 routines</span>
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
                      onClick={() => handleDeleteGroup(group.id)}
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
          
          {/* Add new group button (mobile only) */}
          <div className="fixed bottom-20 right-4 md:hidden">
            <Button 
              onClick={() => handleOpenEditGroupModal()}
              className="rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
              size="icon"
            >
              <Plus size={24} />
            </Button>
          </div>
        </div>
      </main>
      
      {/* Edit Group Modal */}
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
                  Icon
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
