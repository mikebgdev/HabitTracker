import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { AddRoutineModal } from '@/components/AddRoutineModal';
import { EditRoutineModal } from '@/components/EditRoutineModal';
import { AssignGroupToRoutine } from '@/components/AssignGroupToRoutine';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Archive,
  BatteryMedium,
  Bike,
  Book,
  BrainCircuit,
  Coffee,
  Dumbbell,
  Edit,
  Flame,
  Footprints,
  HandPlatter,
  Heart,
  Laptop,
  Microscope,
  Music,
  Palette,
  Pen,
  Plus,
  Smartphone,
  Sparkles,
  Timer,
  Trash,
  Utensils,
  Waves,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/contexts/AuthContext';
import {
  deleteRoutine,
  getUserGroups,
  getUserRoutines,
  updateRoutine,
} from '@/lib/firebase';
import { DeleteRoutineDialog } from '@/components/dialogs/DeleteRoutineDialog';
import { WeekdayScheduleDisplay } from '@/components/WeekdayScheduleDisplay';
import { useI18n } from '@/contexts/I18nProvider';
import type { Group, Routine } from '@/lib/types';
import { ROUTINE_ICONS, PRIORITY_ICONS } from '@/lib/constants';

export default function MyRoutines() {
  const { toast } = useToast();
  const { t } = useI18n();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddRoutineModalOpen, setIsAddRoutineModalOpen] = useState(false);
  const [isEditRoutineModalOpen, setIsEditRoutineModalOpen] = useState(false);
  const [isAssignGroupModalOpen, setIsAssignGroupModalOpen] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState<Routine | null>(null);
  const [routineToEdit, setRoutineToEdit] = useState<Routine | null>(null);
  const [viewArchived, setViewArchived] = useState(false);

  const {
    data: routines = [],
    isLoading,
    refetch: refetchRoutines,
  } = useQuery<Routine[]>({
    queryKey: ['routines', user?.uid],
    queryFn: () => getUserRoutines(user!.uid),
    enabled: !!user,
  });

  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ['groups'],
    queryFn: () => getUserGroups(user?.uid || ''),
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
        title: t('common.success'),
        description: t('routines.deletedSuccess'),
      });
    } catch {
      toast({
        title: t('common.error'),
        description: t('routines.deleteError'),
      });
    } finally {
      setRoutineToDelete(null);
    }
  };

  const handleArchiveRoutine = async (id: string) => {
    try {
      await updateRoutine(id, { archived: true });
      await refetchRoutines();
      toast({
        title: t('common.success'),
        description: t('routines.archivedSuccess'),
      });
    } catch {
      toast({
        title: t('common.error'),
        description: t('routines.archiveError'),
      });
    }
  };


  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('routines.title')}</h2>
        <Button onClick={() => setIsAddRoutineModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> {t('routines.add')}
        </Button>
      </div>

      <div className="flex gap-4 mb-4">
        <Button
          variant={!viewArchived ? 'default' : 'outline'}
          onClick={() => setViewArchived(false)}
        >
          {t('routines.active')}
        </Button>
        <Button
          variant={viewArchived ? 'default' : 'outline'}
          onClick={() => setViewArchived(true)}
        >
          {t('routines.archived')}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-center">{t('routines.loading')}</p>
      ) : routines.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routines
            .filter((r) => (viewArchived ? r.archived : !r.archived))
            .map((routine) => {
              const { icon: PriorityIcon, badge: badgeClasses } =
                PRIORITY_ICONS[routine.priority];
              const IconComponent = routine.icon
                ? ROUTINE_ICONS.find((i) => i.name === routine.icon)?.icon
                : null;

              return (
                <Card key={routine.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        {IconComponent && <IconComponent className="h-5 w-5" />}
                        {routine.name}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={`flex items-center gap-1 text-xs font-medium border ${badgeClasses}`}
                      >
                        <PriorityIcon className="h-4 w-4" />
                        {t(`routines.${routine.priority}`)}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <WeekdayScheduleDisplay routineId={routine.id} />
                    {routine.groupId && (
                      <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {t('routines.groupLabel')}:{' '}
                        {groups.find((g) => g.id === routine.groupId)?.name ||
                          t('routines.unknownGroup')}
                      </div>
                    )}
                    {routine.expectedTime && (
                      <div className="text-sm text-gray-700 dark:text-gray-300 font-medium flex items-center gap-1">
                        🕒 {routine.expectedTime}
                      </div>
                    )}
                  </CardContent>

                  <div className="flex flex-wrap justify-end gap-2 p-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setRoutineToEdit(routine);
                        setIsEditRoutineModalOpen(true);
                      }}
                    >
                      <Edit className="mr-1 h-4 w-4" /> {t('routines.edit')}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleArchiveRoutine(routine.id)}
                    >
                      <Archive className="mr-1 h-4 w-4" />{' '}
                      {t('routines.archive')}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => confirmDeleteRoutine(routine)}
                    >
                      <Trash className="mr-1 h-4 w-4" /> {t('routines.delete')}
                    </Button>
                  </div>
                </Card>
              );
            })}
        </div>
      ) : (
        <p className="text-center">{t('routines.noRoutines')}</p>
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
