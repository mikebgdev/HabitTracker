import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useI18n } from '@/contexts/I18nProvider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getUserGroups, updateRoutine } from '@/lib/firebase';
import { useToast } from '@/hooks/useToast';
import type { Group, Routine } from '@/lib/types';

interface AssignGroupToRoutineProps {
  isOpen: boolean;
  onClose: () => void;
  routine?: Routine;
  onComplete?: () => void;
}

export function AssignGroupToRoutine({
  isOpen,
  onClose,
  routine,
  onComplete,
}: AssignGroupToRoutineProps) {
  const { toast } = useToast();
  const { t } = useI18n();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const client = useQueryClient();
  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ['groups'],
    queryFn: () => getUserGroups(user?.uid || ''),
    enabled: !!user,
  });

  useEffect(() => {
    if (routine?.groupId) {
      setSelectedGroupId(routine.groupId);
    } else {
      setSelectedGroupId(null);
    }
  }, [routine]);

  const assignMutation = useMutation({
    mutationFn: async () => {
      if (!routine || !user) return;
      await updateRoutine(routine.id, {
        groupId: selectedGroupId || undefined,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Grupo asignado',
        description: selectedGroupId
          ? `La rutina ha sido asignada al grupo correctamente.`
          : `La rutina ha sido removida del grupo.`,
      });
      client.invalidateQueries({ queryKey: ['routines'] });
      client.invalidateQueries({ queryKey: ['groupRoutines'] });
      client.invalidateQueries({ queryKey: ['groups'] });
      onComplete?.();
      onClose();
    },
    onError: (error) => {
      console.error('Error assigning group:', error);
      toast({
        title: 'Error',
        description:
          'No se pudo asignar el grupo a la rutina. Inténtalo de nuevo.',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    assignMutation.mutate();

    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white dark:bg-gray-800 max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('routines.assignToGroup')}
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            {t('routines.assignToGroupDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Select
              value={selectedGroupId || ''}
              onValueChange={setSelectedGroupId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('routines.selectGroup')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('routines.none')}</SelectItem>
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
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {isSubmitting ? t('common.loading') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
