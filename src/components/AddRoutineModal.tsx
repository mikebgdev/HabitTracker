import React, { useState } from 'react';
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
import {
  dayToggleClass,
  ICON_CATEGORIES,
  PRIORITY_ICONS,
  ROUTINE_ICON_MAP,
  WEEKDAYS,
} from '@/lib/constants';

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
  const [icon, setIcon] = useState<string | null>(null);
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

      await updateWeekdaySchedule(routineId, user.uid, selectedDays);

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

  const SelectedIcon = icon ? ROUTINE_ICON_MAP[icon] : null;

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
                {t('routines.expectedTime')} (
                {t('routines.expectedTimePlaceholder')})
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
                value={priority}
                onValueChange={(val: 'high' | 'medium' | 'low') =>
                  setPriority(val)
                }
              >
                <SelectTrigger id="routine-priority">
                  <SelectValue placeholder={t('routines.selectPriority')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">
                    <div className="flex items-center">
                      {React.createElement(PRIORITY_ICONS['high'].icon, {
                        className: `mr-2 h-4 w-4 ${PRIORITY_ICONS['high'].color}`,
                      })}
                      <span>{t('routines.high')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center">
                      {React.createElement(PRIORITY_ICONS['medium'].icon, {
                        className: `mr-2 h-4 w-4 ${PRIORITY_ICONS['medium'].color}`,
                      })}
                      <span>{t('routines.medium')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="low">
                    <div className="flex items-center">
                      {React.createElement(PRIORITY_ICONS['low'].icon, {
                        className: `mr-2 h-4 w-4 ${PRIORITY_ICONS['low'].color}`,
                      })}
                      <span>{t('routines.low')}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mb-4">
              <Label
                htmlFor="routine-icon"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {t('routines.iconLabel')}
              </Label>
              <Select
                value={icon || 'none'}
                onValueChange={(val: string) =>
                  setIcon(val === 'none' ? null : val)
                }
              >
                <SelectTrigger id="routine-icon" className="flex items-center">
                  <SelectValue placeholder={t('routines.iconPlaceholder')}>
                    {SelectedIcon ? (
                      <div className="flex items-center">
                        <SelectedIcon className="mr-2 h-4 w-4" />
                        <span>
                          {icon
                            ? icon.charAt(0).toUpperCase() + icon?.slice(1)
                            : ''}
                        </span>
                      </div>
                    ) : (
                      <span>{t('routines.noneIcon')}</span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="none" className="flex items-center gap-2">
                    <div className="w-4 h-4 mr-2"></div>
                    <span>{t('routines.noneIcon')}</span>
                  </SelectItem>

                  {ICON_CATEGORIES.map((category) => (
                    <div key={category.nameKey}>
                      <div className="px-2 py-1.5 text-sm font-semibold text-gray-500 dark:text-gray-400 border-t mt-1">
                        {t(`routines.iconCategory.${category.nameKey}`)}
                      </div>
                      {category.icons.map(
                        ({ name: iconName, icon: Icon, labelKey }) => (
                          <SelectItem
                            key={iconName}
                            value={iconName}
                            className="flex items-center gap-2"
                          >
                            <div className="flex items-center">
                              <Icon className="h-4 w-4 mr-2" />
                              <span>
                                {t(`routines.iconLabels.${labelKey}`)}
                              </span>
                            </div>
                          </SelectItem>
                        ),
                      )}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mb-4">
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('routines.repeatLabel')}
              </Label>
              <div className="grid grid-cols-7 gap-1">
                {WEEKDAYS.map(({ key, label }) => (
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
