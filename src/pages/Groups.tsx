import { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
  SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Plus, Edit, Trash, Clock } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  getUserGroups,
  addGroup,
  updateGroup,
  deleteGroup,
} from '@/lib/firebase';
import { useToast } from '@/hooks/useToast';
import { useI18n } from '@/contexts/I18nProvider';
import type { Group, InsertGroup } from '@/lib/types';

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

  const handleOpenEditGroupModal = (group: Group | null = null) => {
    setEditingGroup(group);
    if (group) {
      setGroupFormState({
        name: group.name,
        icon: group.icon || 'fa-layer-group',
        timeRange: group.timeRange || '',
      });
      const [start, end] = (group.timeRange || '08:00 - 09:00')
        .split(' - ')
        .map((time) => {
          const [h, m, ap] = time.match(/(\d+):(\d+) (AM|PM)/i)!.slice(1);
          let hour = parseInt(h);
          if (ap.toUpperCase() === 'PM' && hour < 12) hour += 12;
          if (ap.toUpperCase() === 'AM' && hour === 12) hour = 0;
          return `${hour.toString().padStart(2, '0')}:${m}`;
        });
      setStartTime(start);
      setEndTime(end);
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
        title: t('groups.confirmDeleteBtn'),
        description: t('groups.deletedSuccess'),
      });
    } catch (err) {
      toast({ title: t('common.error'), description: t('groups.deleteError') });
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
          {groups.map((group) => (
            <Card key={group.id}>
              <CardHeader>
                <CardTitle>{group.name}</CardTitle>
                {group.timeRange && (
                  <CardDescription>
                    <Clock className="inline w-4 h-4 mr-1" /> {group.timeRange}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <p>{t('groups.routinesInGroup')}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
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
          ))}
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
                      {groupFormState.icon && (
                        <div className="flex items-center">
                          <i className={`fas ${groupFormState.icon} mr-2`} />
                          <span>
                            {
                              {
                                'fa-sun': 'Morning',
                                'fa-briefcase': 'Work',
                                'fa-moon': 'Evening',
                                'fa-dumbbell': 'Fitness',
                                'fa-book': 'Study',
                                'fa-layer-group': 'General',
                              }[groupFormState.icon]
                            }
                          </span>
                        </div>
                      )}
                    </SelectValue>
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
