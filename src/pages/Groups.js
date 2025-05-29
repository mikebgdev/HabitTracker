import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Plus, Edit, Trash, Clock } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getUserGroups, addGroup, updateGroup, deleteGroup, } from '@/lib/firebase';
import { useToast } from '@/hooks/useToast';
import { useI18n } from '@/contexts/I18nProvider';
export default function Groups() {
    const { t } = useI18n();
    const { toast } = useToast();
    const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [groupFormState, setGroupFormState] = useState({
        name: '',
        icon: 'fa-layer-group',
        timeRange: '',
    });
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('09:00');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState(null);
    const { user } = useAuth();
    const client = useQueryClient();
    const { data: groups = [], isLoading: isLoadingGroups } = useQuery({
        queryKey: ['groups'],
        queryFn: () => getUserGroups(user?.uid || ''),
        enabled: !!user,
    });
    const handleOpenEditGroupModal = (group = null) => {
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
                const [h, m, ap] = time.match(/(\d+):(\d+) (AM|PM)/i).slice(1);
                let hour = parseInt(h);
                if (ap.toUpperCase() === 'PM' && hour < 12)
                    hour += 12;
                if (ap.toUpperCase() === 'AM' && hour === 12)
                    hour = 0;
                return `${hour.toString().padStart(2, '0')}:${m}`;
            });
            setStartTime(start);
            setEndTime(end);
        }
        else {
            setGroupFormState({ name: '', icon: 'fa-layer-group', timeRange: '' });
            setStartTime('08:00');
            setEndTime('09:00');
        }
        setIsEditGroupModalOpen(true);
    };
    const formatTimeFor12Hour = (time) => {
        const [hours, minutes] = time.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };
    const handleSaveGroup = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const timeRange = `${formatTimeFor12Hour(startTime)} - ${formatTimeFor12Hour(endTime)}`;
        const data = { ...groupFormState, timeRange };
        try {
            if (editingGroup && user) {
                await updateGroup(editingGroup.id, data);
            }
            else if (user) {
                await addGroup({ ...data, userId: user.uid });
            }
            await client.invalidateQueries({ queryKey: ['groups'] });
            setIsEditGroupModalOpen(false);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const confirmDeleteGroup = (groupId) => {
        setGroupToDelete(groupId);
        setIsDeleteDialogOpen(true);
    };
    const handleDeleteGroup = async () => {
        if (!groupToDelete)
            return;
        try {
            await deleteGroup(groupToDelete);
            await client.invalidateQueries({ queryKey: ['groups'] });
            toast({
                title: t('groups.confirmDeleteBtn'),
                description: t('groups.deletedSuccess'),
            });
        }
        catch (err) {
            toast({ title: t('common.error'), description: t('groups.deleteError') });
        }
        finally {
            setIsDeleteDialogOpen(false);
            setGroupToDelete(null);
        }
    };
    const ICON_OPTIONS = [
        { value: 'fa-sun', label: 'Morning', color: 'text-amber-500' },
        { value: 'fa-briefcase', label: 'Work', color: 'text-blue-500' },
        { value: 'fa-moon', label: 'Evening', color: 'text-purple-500' },
        { value: 'fa-dumbbell', label: 'Fitness', color: 'text-red-500' },
        { value: 'fa-book', label: 'Study', color: 'text-green-500' },
        { value: 'fa-layer-group', label: 'General', color: 'text-gray-500' },
    ];
    return (_jsxs(Layout, { children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: t('groups.title') }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: t('groups.description') })] }), _jsxs(Button, { onClick: () => handleOpenEditGroupModal(), children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), " ", t('groups.add')] })] }), isLoadingGroups ? (_jsx("p", { className: "text-center py-8", children: t('groups.loading') })) : groups.length > 0 ? (_jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-4", children: groups.map((group) => (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: group.name }), group.timeRange && (_jsxs(CardDescription, { children: [_jsx(Clock, { className: "inline w-4 h-4 mr-1" }), " ", group.timeRange] }))] }), _jsx(CardContent, { children: _jsx("p", { children: t('groups.routinesInGroup') }) }), _jsxs(CardFooter, { className: "flex justify-end gap-2", children: [_jsxs(Button, { variant: "outline", onClick: () => handleOpenEditGroupModal(group), children: [_jsx(Edit, { className: "mr-1 h-4 w-4" }), " ", t('groups.edit')] }), _jsxs(Button, { variant: "destructive", onClick: () => confirmDeleteGroup(group.id), children: [_jsx(Trash, { className: "mr-1 h-4 w-4" }), " ", t('groups.delete')] })] })] }, group.id))) })) : (_jsxs("div", { className: "text-center py-12", children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: t('groups.noGroups') }), _jsx("p", { className: "text-gray-500 dark:text-gray-400 mb-4", children: t('groups.createFirst') }), _jsx(Button, { onClick: () => handleOpenEditGroupModal(), children: t('groups.add') })] })), _jsx(Dialog, { open: isEditGroupModalOpen, onOpenChange: setIsEditGroupModalOpen, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: editingGroup ? t('groups.editTitle') : t('groups.newTitle') }), _jsx(DialogDescription, { children: editingGroup
                                        ? t('groups.editDescription')
                                        : t('groups.newDescription') })] }), _jsxs("form", { onSubmit: handleSaveGroup, children: [_jsxs("div", { className: "space-y-4 py-2", children: [_jsxs("div", { children: [_jsx(Label, { children: t('groups.name') }), _jsx(Input, { value: groupFormState.name, onChange: (e) => setGroupFormState({
                                                        ...groupFormState,
                                                        name: e.target.value,
                                                    }), required: true })] }), _jsxs("div", { children: [_jsx(Label, { children: t('groups.timeRange') }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Input, { type: "time", value: startTime, onChange: (e) => setStartTime(e.target.value), required: true }), _jsx("span", { children: "-" }), _jsx(Input, { type: "time", value: endTime, onChange: (e) => setEndTime(e.target.value), required: true })] }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [t('groups.preview'), ": ", formatTimeFor12Hour(startTime), " -", ' ', formatTimeFor12Hour(endTime)] })] }), _jsxs("div", { children: [_jsx(Label, { children: t('groups.icon') }), _jsxs(Select, { value: groupFormState.icon, onValueChange: (val) => setGroupFormState({ ...groupFormState, icon: val }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { children: groupFormState.icon &&
                                                                    (() => {
                                                                        const selected = ICON_OPTIONS.find((i) => i.value === groupFormState.icon);
                                                                        return selected ? (_jsxs("div", { className: "flex items-center", children: [_jsx("i", { className: `fas ${selected.value} mr-2 ${selected.color}` }), _jsx("span", { children: selected.label })] })) : null;
                                                                    })() }) }), _jsx(SelectContent, { children: ICON_OPTIONS.map((option) => (_jsx(SelectItem, { value: option.value, children: _jsxs("div", { className: "flex items-center", children: [_jsx("i", { className: `fas ${option.value} mr-2 ${option.color}` }), _jsx("span", { children: option.label })] }) }, option.value))) })] })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => setIsEditGroupModalOpen(false), children: t('common.cancel') }), _jsx(Button, { type: "submit", disabled: isSubmitting, children: isSubmitting ? t('common.loading') : t('common.save') })] })] })] }) }), _jsx(AlertDialog, { open: isDeleteDialogOpen, onOpenChange: setIsDeleteDialogOpen, children: _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: t('groups.confirmDeleteTitle') }), _jsx(AlertDialogDescription, { children: t('groups.confirmDeleteDesc') })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { children: t('common.cancel') }), _jsx(AlertDialogAction, { onClick: handleDeleteGroup, children: t('groups.confirmDeleteBtn') })] })] }) })] }));
}
