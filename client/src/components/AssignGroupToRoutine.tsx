import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Group, Routine } from "@shared/schema";

interface AssignGroupToRoutineProps {
  isOpen: boolean;
  onClose: () => void;
  routine?: Routine;
  onComplete?: () => void;
}

export function AssignGroupToRoutine({ isOpen, onClose, routine, onComplete }: AssignGroupToRoutineProps) {
  const { toast } = useToast();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ['/api/groups'],
  });

  const { data: groupRoutines = [], isLoading: isLoadingGroupRoutines } = useQuery({
    queryKey: ['/api/routines/group-assignments'],
    enabled: !!routine?.id,
  });

  useEffect(() => {
    if (routine && groupRoutines.length > 0) {
      const routineGroup = groupRoutines.find((gr: any) => gr.routineId === routine.id);
      if (routineGroup) {
        setSelectedGroupId(routineGroup.groupId.toString());
      } else {
        setSelectedGroupId(null);
      }
    }
  }, [routine?.id, groupRoutines]);

  const assignMutation = useMutation({
    mutationFn: async () => {
      if (!routine) return;

      const endpoint = `/api/routines/${routine.id}/assign-group`;
      const groupId = selectedGroupId ? parseInt(selectedGroupId) : null;
      
      await apiRequest("POST", endpoint, { groupId });
    },
    onSuccess: () => {
      toast({
        title: "Grupo asignado",
        description: selectedGroupId 
          ? `La rutina ha sido asignada al grupo correctamente.` 
          : `La rutina ha sido removida del grupo.`
      });

      queryClient.invalidateQueries({ queryKey: ['/api/routines'] });
      queryClient.invalidateQueries({ queryKey: ['/api/routines/group-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      
      if (onComplete) {
        onComplete();
      }
      
      onClose();
    },
    onError: (error) => {
      console.error("Error assigning group:", error);
      toast({
        title: "Error",
        description: "No se pudo asignar el grupo a la rutina. Inténtalo de nuevo."
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    assignMutation.mutate();
    
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="bg-white dark:bg-gray-800 max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Asignar a Grupo
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            Selecciona un grupo para asignar esta rutina o déjalo vacío para no asignarla a ningún grupo.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Select
              value={selectedGroupId || ""}
              onValueChange={setSelectedGroupId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin grupo</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id.toString()}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="flex justify-end gap-2 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}