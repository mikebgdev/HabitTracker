import { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock, Edit, Plus, Trash } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  addGroup,
  deleteGroup,
  getUserGroups,
  getUserRoutines,
  updateGroup,
} from '@/lib/firebase';
import { useToast } from '@/contexts/ToastContext';
import { useI18n } from '@/contexts/I18nProvider';
import type { Group, InsertGroup, Routine } from '@/lib/types';
import { GROUP_ICON_OPTIONS } from '@/lib/constants';

export default function Groups() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [groupFormState, setGroupFormState] = useState<Partial<InsertGroup>>({
    name: '',
    icon: 'fa-layer-group',
    timeRange: '',
  });
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);
  const { user } = useAuth();
  const client = useQueryClient();

  const { data: groups = [], isLoading: isLoadingGroups } = useQuery<Group[]>({
    queryKey: ['groups'],
    queryFn: () => getUserGroups(user?.uid || ''),
    enabled: !!user,
  });

  const { data: routines = [] } = useQuery<Routine[]>({
    queryKey: ['routines'],
    queryFn: () => getUserRoutines(user?.uid || ''),
    enabled: !!user,
  });

  const handleOpenEditGroupModal = (group: Group | null = null) => {
    setEditingGroup(group);
    if (group) {
      setGroupFormState({
        name: group.name,
        icon: group.icon || 'fa-layer-group',
        timeRange: group.timeRange || '',
      });
      const timeRangeStr = group.timeRange || '08:00 - 09:00';
      const parts = timeRangeStr.split(/\s*-\s*/);
      let parsedStart = '08:00';
      let parsedEnd = '09:00';
      if (parts.length === 2) {
        const [startStr, endStr] = parts.map((s) => s.trim());
        const regex12h = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
        const m1 = startStr.match(regex12h);
        const m2 = endStr.match(regex12h);
        if (m1 && m2) {
          let sh = parseInt(m1[1], 10);
          const sm = m1[2];
          let eh = parseInt(m2[1], 10);
          const em = m2[2];
          const sap = m1[3].toUpperCase();
          const eap = m2[3].toUpperCase();
          if (sap === 'PM' && sh < 12) sh += 12;
          if (sap === 'AM' && sh === 12) sh = 0;
          if (eap === 'PM' && eh < 12) eh += 12;
          if (eap === 'AM' && eh === 12) eh = 0;
          parsedStart = sh.toString().padStart(2, '0') + ':' + sm;
          parsedEnd = eh.toString().padStart(2, '0') + ':' + em;
        } else {
          parsedStart = startStr;
          parsedEnd = endStr;
        }
      }
      setStartTime(parsedStart);
      setEndTime(parsedEnd);
    } else {
      setGroupFormState({ name: '', icon: 'fa-layer-group', timeRange: '' });
      setStartTime('08:00');
      setEndTime('09:00');
    }
    setIsEditGroupModalOpen(true);
  };

  const formatTimeFor12Hour = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const timeRange = `${formatTimeFor12Hour(startTime)} - ${formatTimeFor12Hour(endTime)}`;
    const data = { ...groupFormState, timeRange } as Omit<
      InsertGroup,
      'userId'
    >;
    try {
      if (editingGroup && user) {
        await updateGroup(editingGroup.id, data);
      } else if (user) {
        await addGroup({ ...data, userId: user.uid });
      }
      await client.invalidateQueries({ queryKey: ['groups'] });
      setIsEditGroupModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteGroup = (groupId: string) => {
    setGroupToDelete(groupId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;
    try {
      await deleteGroup(groupToDelete);
      await client.invalidateQueries({ queryKey: ['groups'] });
      toast({
        title: t('common.success'),
        description: t('groups.deletedSuccess'),
        variant: 'success',
      });
    } catch (err) {
      toast({ title: t('common.error'), description: t('groups.deleteError'), variant: 'error' });
    } finally {
      setIsDeleteDialogOpen(false);
      setGroupToDelete(null);
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">{t('groups.title')}</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('groups.description')}
          </p>
        </div>
        <Button onClick={() => handleOpenEditGroupModal()}>
          <Plus className="mr-2 h-4 w-4" /> {t('groups.add')}
        </Button>
      </div>

      {isLoadingGroups ? (
        <p className="text-center py-8">{t('groups.loading')}</p>
      ) : groups.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => {
            const routineCount = routines.filter(
              (r) => r.groupId === group.id,
            ).length;
            const iconData = GROUP_ICON_OPTIONS.find(
              (i) => i.value === group.icon,
            );
            return (
              <Card key={group.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {iconData && (
                      <i
                        className={`fas ${iconData.value} ${iconData.color}`}
                      />
                    )}
                    {group.name}
                  </CardTitle>
                  {group.timeRange && (
                    <CardDescription>
                      <Clock className="inline w-4 h-4 mr-1" />{' '}
                      {group.timeRange}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p>
                    {t('groups.routinesInGroup')}:{' '}
                    <strong>{routineCount}</strong>
                  </p>
                </CardContent>
                <CardFooter className="flex flex-wrap justify-end gap-2 p-4">
                  <Button
                    variant="outline"
                    onClick={() => handleOpenEditGroupModal(group)}
                  >
                    <Edit className="mr-1 h-4 w-4" /> {t('groups.edit')}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => confirmDeleteGroup(group.id)}
                  >
                    <Trash className="mr-1 h-4 w-4" /> {t('groups.delete')}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">{t('groups.noGroups')}</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {t('groups.createFirst')}
          </p>
          <Button onClick={() => handleOpenEditGroupModal()}>
            {t('groups.add')}
          </Button>
        </div>
      )}

      <Dialog
        open={isEditGroupModalOpen}
        onOpenChange={setIsEditGroupModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? t('groups.editTitle') : t('groups.newTitle')}
            </DialogTitle>
            <DialogDescription>
              {editingGroup
                ? t('groups.editDescription')
                : t('groups.newDescription')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveGroup}>
            <div className="space-y-4 py-2">
              <div>
                <Label>{t('groups.name')}</Label>
                <Input
                  value={groupFormState.name}
                  onChange={(e) =>
                    setGroupFormState({
                      ...groupFormState,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label>{t('groups.timeRange')}</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                  <span>-</span>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {t('groups.preview')}: {formatTimeFor12Hour(startTime)} -{' '}
                  {formatTimeFor12Hour(endTime)}
                </p>
              </div>
              <div>
                <Label>{t('groups.icon')}</Label>
                <Select
                  value={groupFormState.icon}
                  onValueChange={(val) =>
                    setGroupFormState({ ...groupFormState, icon: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue>
                      {groupFormState.icon &&
                        (() => {
                          const selected = GROUP_ICON_OPTIONS.find(
                            (i) => i.value === groupFormState.icon,
                          );
                          return selected ? (
                            <div className="flex items-center">
                              <i
                                className={`fas ${selected.value} mr-2 ${selected.color}`}
                              />
                              <span>{selected.label}</span>
                            </div>
                          ) : null;
                        })()}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {GROUP_ICON_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <i
                            className={`fas ${option.value} mr-2 ${option.color}`}
                          />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditGroupModalOpen(false)}
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

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('groups.confirmDeleteTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('groups.confirmDeleteDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGroup}>
              {t('groups.confirmDeleteBtn')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
