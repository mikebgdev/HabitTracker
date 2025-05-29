import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
  getUserGroups,
  getWeekdaySchedule,
  updateWeekdaySchedule,
  updateRoutine,
} from '@/lib/firebase';
import { useToast } from '@/hooks/useToast';
import { useI18n } from '@/contexts/I18nProvider';
import {
  Flame,
  Timer,
  BatteryMedium,
  Activity,
  Bike,
  Book,
  BrainCircuit,
  Coffee,
  Dumbbell,
  Footprints,
  HandPlatter,
  Heart,
  Laptop,
  LucideIcon,
  Microscope,
  Music,
  Palette,
  Pen,
  Smartphone,
  Sparkles,
  Utensils,
  Waves,
} from 'lucide-react';
import type {
  Group,
  Routine,
  InsertRoutine,
  WeekdaySchedule,
  InsertWeekdaySchedule,
  DayKey,
} from '@/lib/types';

interface EditRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  routine?: Routine;
  onRoutineUpdated?: () => Promise<void>;
}

const ICON_CATEGORIES = [
  {
    nameKey: 'activities',
    icons: [
      { name: 'activity', icon: Activity, labelKey: 'activity' },
      { name: 'bike', icon: Bike, labelKey: 'bike' },
      { name: 'footprints', icon: Footprints, labelKey: 'footprints' },
      { name: 'dumbbell', icon: Dumbbell, labelKey: 'dumbbell' },
      { name: 'palette', icon: Palette, labelKey: 'palette' },
      { name: 'music', icon: Music, labelKey: 'music' },
      { name: 'waves', icon: Waves, labelKey: 'waves' },
    ],
  },
  {
    nameKey: 'workStudy',
    icons: [
      { name: 'book', icon: Book, labelKey: 'book' },
      { name: 'brain', icon: BrainCircuit, labelKey: 'brain' },
      { name: 'laptop', icon: Laptop, labelKey: 'laptop' },
      { name: 'microscope', icon: Microscope, labelKey: 'microscope' },
      { name: 'pen', icon: Pen, labelKey: 'pen' },
      { name: 'phone', icon: Smartphone, labelKey: 'phone' },
    ],
  },
  {
    nameKey: 'healthWellness',
    icons: [
      { name: 'coffee', icon: Coffee, labelKey: 'coffee' },
      { name: 'food', icon: HandPlatter, labelKey: 'food' },
      { name: 'heart', icon: Heart, labelKey: 'heart' },
      { name: 'sparkles', icon: Sparkles, labelKey: 'sparkles' },
      { name: 'utensils', icon: Utensils, labelKey: 'utensils' },
    ],
  },
];

const ROUTINE_ICONS = ICON_CATEGORIES.flatMap((category) => category.icons);

const PRIORITY_ICONS = {
  high: { icon: Flame, color: 'text-red-500' },
  medium: { icon: BatteryMedium, color: 'text-yellow-500' },
  low: { icon: Timer, color: 'text-blue-500' },
};

export function EditRoutineModal({
  isOpen,
  onClose,
  routine,
  onRoutineUpdated,
}: EditRoutineModalProps) {
  const { toast } = useToast();
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [expectedTime, setExpectedTime] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [icon, setIcon] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);
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
  const [routineId, setRoutineId] = useState<string | null>(null);

  const { user } = useAuth();
  const client = useQueryClient();
  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ['groups'],
    queryFn: () => getUserGroups(user?.uid || ''),
    enabled: !!user,
  });

  const { data: weekdaySchedule, isLoading: isLoadingSchedule } =
    useQuery<WeekdaySchedule>({
      queryKey: ['weekdaySchedule', routineId],
      queryFn: () => getWeekdaySchedule(routineId!),
      enabled: !!routineId,
    });

  useEffect(() => {
    if (routine) {
      setName(routine.name);
      setExpectedTime(routine.expectedTime);
      setPriority(routine.priority);
      setIcon(routine.icon || null);
      setRoutineId(routine.id);
    } else {
      resetForm();
    }
  }, [routine, isOpen]);

  useEffect(() => {
    if (routine?.groupId) {
      setGroupId(routine.groupId);
    } else {
      setGroupId(null);
    }
  }, [routine?.id]);

  useEffect(() => {
    if (routine && weekdaySchedule && typeof weekdaySchedule === 'object') {
      setSelectedDays({
        monday: !!weekdaySchedule.monday,
        tuesday: !!weekdaySchedule.tuesday,
        wednesday: !!weekdaySchedule.wednesday,
        thursday: !!weekdaySchedule.thursday,
        friday: !!weekdaySchedule.friday,
        saturday: !!weekdaySchedule.saturday,
        sunday: !!weekdaySchedule.sunday,
      });
    }
  }, [routine?.id, weekdaySchedule]);

  const toggleDay = (day: DayKey) => {
    setSelectedDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const resetForm = () => {
    setName('');
    setExpectedTime('');
    setPriority('medium');
    setGroupId(null);
    setIcon(null);
    setSelectedDays({
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    });
    setRoutineId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const routineData: Partial<InsertRoutine> & {
        groupId?: string;
        weekdays?: Record<string, boolean>;
      } = {
        name,
        expectedTime,
        priority,
        ...(icon ? { icon } : {}),
      };

      if (groupId) {
        routineData.groupId = groupId;
      }

      routineData.weekdays = selectedDays;

      if (routineId) {
        await updateRoutine(routineId, routineData);
        await updateWeekdaySchedule(routineId, selectedDays);

        toast({
          title: t('common.success'),
          description: t('routines.updatedSuccessDescription', { routineName: name }),
        });
      } else {
        console.error('Trying to update routine without ID');
        return;
      }

      if (onRoutineUpdated) {
        await onRoutineUpdated();
      }

      onClose();
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('routines.updateErrorDescription'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPriorityIcon = (priorityLevel: 'high' | 'medium' | 'low') => {
    const { icon: Icon, color } = PRIORITY_ICONS[priorityLevel];
    return <Icon className={`mr-2 h-4 w-4 inline-flex ${color}`} />;
  };

  const getIconComponent = (iconName: string | null): LucideIcon | null => {
    if (!iconName) return null;
    return ROUTINE_ICONS.find((item) => item.name === iconName)?.icon || null;
  };

  const getSelectedIcon = (): LucideIcon | null => {
    if (!icon) return null;
    const found = ROUTINE_ICONS.find((i) => i.name === icon);
    return found ? found.icon : null;
  };

  const SelectedIcon = getSelectedIcon();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white dark:bg-gray-800 max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            {SelectedIcon && <SelectedIcon className="mr-2 h-5 w-5" />}
            {t('routines.editTitle')}
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            {t('routines.editDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="mb-4">
              <Label
                htmlFor="routine-name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >{t('routines.name')}</Label>
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
              >{t('routines.expectedTimeLabel')}</Label>
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
              >{t('routines.groupLabel')}</Label>
              <Select
                value={groupId?.toString() || 'none'}
                onValueChange={(val) => setGroupId(val === 'none' ? null : val)}
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
                </SelectContent>
              </Select>
            </div>

            <div className="mb-4">
              <Label
                htmlFor="routine-priority"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >{t('routines.priorityLabel')}</Label>
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
              >{t('routines.iconLabel')}</Label>
              <Select
                value={icon || 'none'}
                onValueChange={(val: string) =>
                  setIcon(val === 'none' ? null : val)
                }
              >
                  <SelectTrigger id="routine-icon" className="flex items-center">
                  <SelectValue placeholder={t('routines.iconPlaceholder')}>
                    {icon && getIconComponent(icon) ? (
                      <div className="flex items-center">
                        {React.createElement(
                          getIconComponent(icon) as React.ElementType,
                          {
                            className: 'mr-2 h-4 w-4',
                          },
                        )}
                        <span>
                          {icon.charAt(0).toUpperCase() + icon.slice(1)}
                        </span>
                      </div>
                    ) : (
                      {t('routines.noneIcon')}
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
                              <span>{t(`routines.iconLabels.${labelKey}`)}</span>
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
                <Toggle
                  pressed={selectedDays.monday}
                  onPressedChange={() => toggleDay('monday')}
                  className={`text-sm font-medium text-center border ${
                    selectedDays.monday
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  L
                </Toggle>
                <Toggle
                  pressed={selectedDays.tuesday}
                  onPressedChange={() => toggleDay('tuesday')}
                  className={`text-sm font-medium text-center border ${
                    selectedDays.tuesday
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  M
                </Toggle>
                <Toggle
                  pressed={selectedDays.wednesday}
                  onPressedChange={() => toggleDay('wednesday')}
                  className={`text-sm font-medium text-center border ${
                    selectedDays.wednesday
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  X
                </Toggle>
                <Toggle
                  pressed={selectedDays.thursday}
                  onPressedChange={() => toggleDay('thursday')}
                  className={`text-sm font-medium text-center border ${
                    selectedDays.thursday
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  J
                </Toggle>
                <Toggle
                  pressed={selectedDays.friday}
                  onPressedChange={() => toggleDay('friday')}
                  className={`text-sm font-medium text-center border ${
                    selectedDays.friday
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  V
                </Toggle>
                <Toggle
                  pressed={selectedDays.saturday}
                  onPressedChange={() => toggleDay('saturday')}
                  className={`text-sm font-medium text-center border ${
                    selectedDays.saturday
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  S
                </Toggle>
                <Toggle
                  pressed={selectedDays.sunday}
                  onPressedChange={() => toggleDay('sunday')}
                  className={`text-sm font-medium text-center border ${
                    selectedDays.sunday
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                  }`}
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
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('common.loading') : t('routines.saveChanges')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
