import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { AddRoutineModal } from '@/components/AddRoutineModal';
import { EditRoutineModal } from '@/components/EditRoutineModal';
import { AssignGroupToRoutine } from '@/components/AssignGroupToRoutine';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/contexts/AuthContext';
import { getUserRoutines, deleteRoutine } from '@/lib/firebase';
import { DeleteRoutineDialog } from '@/components/dialogs/DeleteRoutineDialog';
import { WeekdayScheduleDisplay } from '@/components/WeekdayScheduleDisplay';
import type { Routine } from '@/lib/types';

export default function MyRoutines() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddRoutineModalOpen, setIsAddRoutineModalOpen] = useState(false);
  const [isEditRoutineModalOpen, setIsEditRoutineModalOpen] = useState(false);
  const [isAssignGroupModalOpen, setIsAssignGroupModalOpen] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState<Routine | null>(null);
  const [routineToEdit, setRoutineToEdit] = useState<Routine | null>(null);

  const {
    data: routines = [],
    isLoading,
    refetch: refetchRoutines,
  } = useQuery<Routine[]>({
    queryKey: ['routines', user?.uid],
    queryFn: () => getUserRoutines(user!.uid),
    enabled: !!user,
  });

  const confirmDeleteRoutine = (routine: Routine) => {
    setRoutineToDelete(routine);
  };

  const handleDeleteRoutine = async () => {
    if (!routineToDelete) return;
    try {
      await deleteRoutine(routineToDelete.id);
      await queryClient.invalidateQueries({
        queryKey: ['routines', user?.uid],
      });
      toast({
        title: 'Rutina eliminada',
        description: 'La rutina ha sido eliminada correctamente',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la rutina. Inténtalo de nuevo.',
      });
    } finally {
      setRoutineToDelete(null);
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Mis Rutinas</h2>
        <Button onClick={() => setIsAddRoutineModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Agregar Rutina
        </Button>
      </div>

      {isLoading ? (
        <p className="text-center">Cargando rutinas...</p>
      ) : routines.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routines.map((routine) => (
            <Card key={routine.id}>
              <CardHeader>
                <CardTitle>{routine.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <WeekdayScheduleDisplay routineId={routine.id} />
              </CardContent>
              <div className="flex justify-end gap-2 p-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRoutineToEdit(routine);
                    setIsEditRoutineModalOpen(true);
                  }}
                >
                  <Edit className="mr-1 h-4 w-4" /> Editar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => confirmDeleteRoutine(routine)}
                >
                  <Trash className="mr-1 h-4 w-4" /> Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center">No se encontraron rutinas.</p>
      )}

      <AddRoutineModal
        isOpen={isAddRoutineModalOpen}
        onClose={() => setIsAddRoutineModalOpen(false)}
        onRoutineCreated={async () => {
          await refetchRoutines();
        }}
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
        }}
      />

      <DeleteRoutineDialog
        open={!!routineToDelete}
        onOpenChange={(open) => {
          if (!open) setRoutineToDelete(null);
        }}
        onConfirm={handleDeleteRoutine}
        routineName={routineToDelete?.name}
      />

      <AssignGroupToRoutine
        isOpen={isAssignGroupModalOpen}
        onClose={() => setIsAssignGroupModalOpen(false)}
        routine={routineToEdit || undefined}
        onComplete={refetchRoutines}
      />
    </Layout>
  );
}
