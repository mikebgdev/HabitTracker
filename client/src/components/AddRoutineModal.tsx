import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Group, InsertRoutine } from "@shared/schema";

interface AddRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoutineCreated?: () => Promise<void>;
}

export function AddRoutineModal({ isOpen, onClose, onRoutineCreated }: AddRoutineModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [expectedTime, setExpectedTime] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [groupId, setGroupId] = useState<number | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [showNewGroupInput, setShowNewGroupInput] = useState(false);
  const [selectedDays, setSelectedDays] = useState<Record<string, boolean>>({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch groups for dropdown
  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ['/api/groups'],
  });

  const toggleDay = (day: string) => {
    setSelectedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const handleGroupChange = (value: string) => {
    if (value === "new") {
      setShowNewGroupInput(true);
      setGroupId(null);
    } else {
      setShowNewGroupInput(false);
      setGroupId(parseInt(value, 10));
    }
  };

  const resetForm = () => {
    setName("");
    setExpectedTime("");
    setPriority("medium");
    setGroupId(null);
    setNewGroupName("");
    setShowNewGroupInput(false);
    setSelectedDays({
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalGroupId = groupId;

      // If creating a new group
      if (showNewGroupInput && newGroupName) {
        const response = await apiRequest("POST", "/api/groups", {
          name: newGroupName,
        });
        const newGroup = await response.json();
        finalGroupId = newGroup.id;
      }

      // Create routine
      const routineData: InsertRoutine & { 
        groupId?: number;
        weekdays?: Record<string, boolean>;
      } = {
        name,
        expectedTime,
        priority,
        userId: 1, // This would come from auth context in a real app
      };

      if (finalGroupId) {
        routineData.groupId = finalGroupId;
      }

      routineData.weekdays = selectedDays;

      const response = await apiRequest("POST", "/api/routines", routineData);
      const newRoutine = await response.json();

      // Mostrar notificación de éxito
      toast({
        title: "Rutina creada",
        description: `La rutina "${name}" ha sido creada correctamente.`
      });

      // Actualizar los datos usando la función de refetch si está disponible
      if (onRoutineCreated) {
        await onRoutineCreated();
      } else {
        // Fallback para actualizar mediante invalidación de consultas
        await queryClient.invalidateQueries({ queryKey: ['/api/routines'] });
        await queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
        await queryClient.invalidateQueries({ queryKey: ['/api/routines/daily'] });
      }

      resetForm();
      onClose();
    } catch (error) {
      console.error("Failed to create routine:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la rutina. Inténtalo de nuevo."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="bg-white dark:bg-gray-800 max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Add New Routine
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            Create a new routine to track daily habits
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="mb-4">
              <Label htmlFor="routine-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Routine Name
              </Label>
              <Input 
                id="routine-name"
                value={name}
                onChange={e => setName(e.target.value)}
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
                value={expectedTime}
                onChange={e => setExpectedTime(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-4">
              <Label htmlFor="routine-group" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Group
              </Label>
              <Select onValueChange={handleGroupChange}>
                <SelectTrigger id="routine-group">
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map(group => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">Create New Group...</SelectItem>
                </SelectContent>
              </Select>
              
              {showNewGroupInput && (
                <div className="mt-2">
                  <Input 
                    value={newGroupName}
                    onChange={e => setNewGroupName(e.target.value)}
                    placeholder="Enter new group name"
                    className="mt-1"
                    required={showNewGroupInput}
                  />
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <Label htmlFor="routine-priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </Label>
              <Select defaultValue={priority} onValueChange={(val: "high" | "medium" | "low") => setPriority(val)}>
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
                  variant={selectedDays.monday ? "selected" : "day"}
                  pressed={selectedDays.monday}
                  onPressedChange={() => toggleDay("monday")}
                  className="text-xs font-medium text-center"
                >
                  L
                </Toggle>
                <Toggle 
                  variant={selectedDays.tuesday ? "selected" : "day"}
                  pressed={selectedDays.tuesday}
                  onPressedChange={() => toggleDay("tuesday")}
                  className="text-xs font-medium text-center"
                >
                  M
                </Toggle>
                <Toggle 
                  variant={selectedDays.wednesday ? "selected" : "day"}
                  pressed={selectedDays.wednesday}
                  onPressedChange={() => toggleDay("wednesday")}
                  className="text-xs font-medium text-center"
                >
                  X
                </Toggle>
                <Toggle 
                  variant={selectedDays.thursday ? "selected" : "day"}
                  pressed={selectedDays.thursday}
                  onPressedChange={() => toggleDay("thursday")}
                  className="text-xs font-medium text-center"
                >
                  J
                </Toggle>
                <Toggle 
                  variant={selectedDays.friday ? "selected" : "day"}
                  pressed={selectedDays.friday}
                  onPressedChange={() => toggleDay("friday")}
                  className="text-xs font-medium text-center"
                >
                  V
                </Toggle>
                <Toggle 
                  variant={selectedDays.saturday ? "selected" : "day"}
                  pressed={selectedDays.saturday}
                  onPressedChange={() => toggleDay("saturday")}
                  className="text-xs font-medium text-center"
                >
                  S
                </Toggle>
                <Toggle 
                  variant={selectedDays.sunday ? "selected" : "day"}
                  pressed={selectedDays.sunday}
                  onPressedChange={() => toggleDay("sunday")}
                  className="text-xs font-medium text-center"
                >
                  D
                </Toggle>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-end space-x-3 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
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
  );
}
