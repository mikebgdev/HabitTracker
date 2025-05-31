import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  addGroup,
  addRoutine,
  getUserGroups,
  updateWeekdaySchedule,
} from '@/lib/firebase';
import { useToast } from '@/hooks/useToast';
import { useI18n } from '@/contexts/I18nProvider';
import type {
  DayKey,
  Group,
  InsertRoutine,
  InsertWeekdaySchedule,
} from '@/lib/types';

interface AddRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoutineCreated?: () => Promise<void>;
}

export function AddRoutineModal({
  isOpen,
  onClose,
  onRoutineCreated,
}: AddRoutineModalProps) {
  const { toast } = useToast();
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [expectedTime, setExpectedTime] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [groupId, setGroupId] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [showNewGroupInput, setShowNewGroupInput] = useState(false);
  const [selectedDays, setSelectedDays] = useState<
    Omit<InsertWeekdaySchedule, 'id' | 'routineId'>
  >({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const client = useQueryClient();
  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ['groups'],
    queryFn: () => getUserGroups(user?.uid || ''),
    enabled: !!user,
  });

  const toggleDay = (day: DayKey) => {
    setSelectedDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const handleGroupChange = (value: string) => {
    if (value === 'new') {
      setShowNewGroupInput(true);
      setGroupId(null);
    } else if (value === 'none') {
      setShowNewGroupInput(false);
      setGroupId(null);
    } else {
      setShowNewGroupInput(false);
      setGroupId(value);
    }
  };

  const resetForm = () => {
    setName('');
    setExpectedTime('');
    setPriority('medium');
    setGroupId(null);
    setNewGroupName('');
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

      if (showNewGroupInput && newGroupName && user) {
        finalGroupId = await addGroup({ name: newGroupName, userId: user.uid });
      }

      if (!user) throw new Error('Usuario no autenticado');

      const routineData: Omit<InsertRoutine, 'userId'> = {
        name,
        expectedTime,
        priority,
        ...(finalGroupId ? { groupId: finalGroupId } : {}),
      };

      const routineId = await addRoutine({
        ...routineData,
        userId: user.uid,
      });

      await updateWeekdaySchedule(routineId, selectedDays);

      toast({
        title: t('common.success'),
        description: t('routines.createdSuccessDescription', {
          routineName: name,
        }),
      });

      if (onRoutineCreated) {
        await onRoutineCreated();
      } else {
        await client.invalidateQueries({ queryKey: ['routines'] });
        await client.invalidateQueries({ queryKey: ['groups'] });
        await client.invalidateQueries({ queryKey: ['routines', 'daily'] });
      }

      resetForm();
      onClose();
    } catch (error) {
      console.error(error);
      toast({
        title: t('common.error'),
        description: t('routines.createErrorDescription'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const dayToggleClass = (selected: boolean) =>
    `text-xs font-medium text-center px-2 py-1 rounded border transition-colors duration-150 ${
      selected
        ? 'bg-blue-600 text-white border-blue-700 shadow'
        : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`;

  const DAYS: { key: DayKey; label: string }[] = [
    { key: 'monday', label: 'L' },
    { key: 'tuesday', label: 'M' },
    { key: 'wednesday', label: 'X' },
    { key: 'thursday', label: 'J' },
    { key: 'friday', label: 'V' },
    { key: 'saturday', label: 'S' },
    { key: 'sunday', label: 'D' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white dark:bg-gray-800 max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('routines.newTitle')}
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            {t('routines.newDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="mb-4">
              <Label
                htmlFor="routine-name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {t('routines.name')}
              </Label>
              <Input
                id="routine-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('routines.namePlaceholder')}
                required
              />
            </div>

            <div className="mb-4">
              <Label
                htmlFor="routine-time"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Expected Time (Optional)
              </Label>
              <Input
                id="routine-time"
                type="time"
                value={expectedTime}
                onChange={(e) => setExpectedTime(e.target.value)}
                placeholder={t('routines.expectedTimePlaceholder')}
              />
            </div>

            <div className="mb-4">
              <Label
                htmlFor="routine-group"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {t('routines.groupLabel')}
              </Label>
              <Select
                value={groupId ?? 'none'}
                onValueChange={handleGroupChange}
              >
                <SelectTrigger id="routine-group">
                  <SelectValue placeholder={t('routines.selectGroup')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('routines.none')}</SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">
                    {t('routines.createNewGroup')}
                  </SelectItem>
                </SelectContent>
              </Select>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('routines.assignToGroupDescription')}
              </p>
              {showNewGroupInput && (
                <div className="mt-2">
                  <Input
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder={t('routines.newGroupNamePlaceholder')}
                    className="mt-1"
                    required={showNewGroupInput}
                  />
                </div>
              )}
            </div>

            <div className="mb-4">
              <Label
                htmlFor="routine-priority"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {t('routines.priorityLabel')}
              </Label>
              <Select
                defaultValue={priority}
                onValueChange={(val: 'high' | 'medium' | 'low') =>
                  setPriority(val)
                }
              >
                <SelectTrigger id="routine-priority">
                  <SelectValue placeholder={t('routines.selectPriority')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">{t('routines.high')}</SelectItem>
                  <SelectItem value="medium">{t('routines.medium')}</SelectItem>
                  <SelectItem value="low">{t('routines.low')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mb-4">
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('routines.repeatLabel')}
              </Label>
              <div className="grid grid-cols-7 gap-1">
                {DAYS.map(({ key, label }) => (
                  <Toggle
                    key={key}
                    pressed={selectedDays[key]}
                    onPressedChange={() => toggleDay(key)}
                    className={dayToggleClass(selectedDays[key])}
                  >
                    {label}
                  </Toggle>
                ))}
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
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('common.loading') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
