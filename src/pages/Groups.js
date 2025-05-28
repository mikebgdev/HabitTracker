import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, } from "@/components/ui/select";
import { Plus, Edit, Trash, Clock } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getUserGroups, getGroupRoutines, addGroup, updateGroup, deleteGroup, } from "@/lib/firebase";
import { useToast } from "@/hooks/useToast";
export default function Groups() {
    const { toast } = useToast();
    const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [groupFormState, setGroupFormState] = useState({
        name: "",
        icon: "fa-layer-group",
        timeRange: "",
    });
    const [startTime, setStartTime] = useState("08:00");
    const [endTime, setEndTime] = useState("09:00");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [routineCountByGroup, setRoutineCountByGroup] = useState({});
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState(null);
    const { user } = useAuth();
    const client = useQueryClient();
    const { data: groups = [], isLoading: isLoadingGroups } = useQuery(['groups'], () => getUserGroups(user?.uid || ''), { enabled: !!user });
    const { data: groupRoutines = [], isLoading: isLoadingGroupRoutines } = useQuery(['groupRoutines'], getGroupRoutines);
    useEffect(() => {
        if (Array.isArray(groupRoutines) && groupRoutines.length > 0) {
            const counts = {};
            groupRoutines.forEach((gr) => {
                if (!counts[gr.groupId]) {
                    counts[gr.groupId] = 0;
                }
                counts[gr.groupId]++;
            });
            setRoutineCountByGroup(counts);
        }
        else {
            setRoutineCountByGroup({});
        }
    }, [groupRoutines]);
    const handleOpenEditGroupModal = (group = null) => {
        setEditingGroup(group);
        if (group) {
            setGroupFormState({
                name: group.name,
                icon: group.icon || "fa-layer-group",
                timeRange: group.timeRange || "",
            });
            if (group.timeRange) {
                const timeParts = group.timeRange.split(" - ");
                if (timeParts.length === 2) {
                    const convertToMilitaryTime = (time) => {
                        const [timePart, ampm] = time.split(" ");
                        let [hours, minutes] = timePart.split(":");
                        hours = parseInt(hours) === 12 ? "00" : hours;
                        if (ampm === "PM" && parseInt(hours) < 12) {
                            hours = (parseInt(hours) + 12).toString();
                        }
                        return `${hours.padStart(2, "0")}:${minutes}`;
                    };
                    setStartTime(convertToMilitaryTime(timeParts[0]));
                    setEndTime(convertToMilitaryTime(timeParts[1]));
                }
            }
            else {
                setStartTime("08:00");
                setEndTime("09:00");
            }
        }
        else {
            setGroupFormState({
                name: "",
                icon: "fa-layer-group",
                timeRange: "",
            });
            setStartTime("08:00");
            setEndTime("09:00");
        }
        setIsEditGroupModalOpen(true);
    };
    const formatTimeFor12Hour = (time) => {
        const [hours, minutes] = time.split(":");
        const h = parseInt(hours);
        const ampm = h >= 12 ? "PM" : "AM";
        const hour12 = h % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };
    const handleSaveGroup = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formattedStartTime = formatTimeFor12Hour(startTime);
        const formattedEndTime = formatTimeFor12Hour(endTime);
        const timeRange = `${formattedStartTime} - ${formattedEndTime}`;
        try {
            const dataToSend = {
                ...groupFormState,
                timeRange,
            };
            if (editingGroup && user) {
                await updateGroup(editingGroup.id, dataToSend);
            }
            else if (user) {
                await addGroup({ ...dataToSend, userId: user.uid });
            }
            await client.invalidateQueries(['groups']);
            await client.invalidateQueries(['groupRoutines']);
            setIsEditGroupModalOpen(false);
        }
        catch (error) {
            console.error("Failed to save group:", error);
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
            await client.invalidateQueries(['groups']);
            await client.invalidateQueries(['groupRoutines']);
            toast({
                title: "Grupo eliminado",
                description: "El grupo ha sido eliminado correctamente"
            });
        }
        catch (error) {
            console.error("Failed to delete group:", error);
            toast({
                title: "Error",
                description: "No se pudo eliminar el grupo. Inténtalo de nuevo."
            });
        }
        finally {
            setIsDeleteDialogOpen(false);
            setGroupToDelete(null);
        }
    };
    const getIconClass = (iconName) => {
        if (!iconName)
            return "text-primary fas fa-layer-group";
        switch (iconName) {
            case "fa-sun":
                return "text-amber-500 fas fa-sun";
            case "fa-briefcase":
                return "text-blue-500 fas fa-briefcase";
            case "fa-moon":
                return "text-purple-500 fas fa-moon";
            case "fa-dumbbell":
                return "text-red-500 fas fa-dumbbell";
            case "fa-book":
                return "text-green-500 fas fa-book";
            default:
                return `text-primary fas ${iconName}`;
        }
    };
    const isLoading = isLoadingGroups || isLoadingGroupRoutines;
    return (_jsxs(Layout, { children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Routine Groups" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Organize your routines into logical groups" })] }), _jsx("div", { className: "mt-4 md:mt-0", children: _jsxs(Button, { onClick: () => handleOpenEditGroupModal(), className: "flex items-center", children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), " Add Group"] }) })] }), isLoading ? (_jsx("div", { className: "text-center py-8", children: _jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "Loading groups..." }) })) : groups.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: groups.map((group) => (_jsxs(Card, { className: "overflow-hidden", children: [_jsxs(CardHeader, { className: "p-4", children: [_jsxs("div", { className: "flex items-center mb-2", children: [_jsx("div", { className: "mr-3 text-xl", children: _jsx("i", { className: getIconClass(group.icon) }) }), _jsx(CardTitle, { className: "text-lg font-semibold", children: group.name })] }), group.timeRange && (_jsx(CardDescription, { children: _jsxs("div", { className: "flex items-center text-sm text-gray-500 dark:text-gray-400", children: [_jsx(Clock, { className: "w-4 h-4 mr-1" }), _jsx("span", { children: group.timeRange })] }) }))] }), _jsxs(CardContent, { className: "p-4 pt-0", children: [_jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400 mb-2", children: "Routines in this group:" }), _jsx("div", { className: "text-gray-900 dark:text-white", children: _jsxs("span", { className: "font-medium", children: [routineCountByGroup[group.id] || 0, " routine", routineCountByGroup[group.id] !== 1 ? 's' : ''] }) })] }), _jsxs(CardFooter, { className: "flex justify-end space-x-2 p-4 border-t border-gray-200 dark:border-gray-700", children: [_jsxs(Button, { variant: "outline", size: "sm", className: "text-gray-700 dark:text-gray-300", onClick: () => handleOpenEditGroupModal(group), children: [_jsx(Edit, { className: "h-4 w-4 mr-1" }), " Edit"] }), _jsxs(Button, { variant: "outline", size: "sm", className: "text-red-600 dark:text-red-400", onClick: () => confirmDeleteGroup(group.id), children: [_jsx(Trash, { className: "h-4 w-4 mr-1" }), " Delete"] })] })] }, group.id))) })) : (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 dark:text-white mb-2", children: "No groups found" }), _jsx("p", { className: "text-gray-500 dark:text-gray-400 mb-4", children: "You haven't created any groups yet. Groups help you organize your routines." }), _jsx(Button, { onClick: () => handleOpenEditGroupModal(), children: "Create Your First Group" })] })), _jsx("div", { className: "fixed bottom-20 right-4 md:hidden", children: _jsx(Button, { onClick: () => handleOpenEditGroupModal(), className: "rounded-full w-14 h-14 flex items-center justify-center shadow-lg", size: "icon", children: _jsx(Plus, { size: 24 }) }) }), _jsx(Dialog, { open: isEditGroupModalOpen, onOpenChange: setIsEditGroupModalOpen, children: _jsxs(DialogContent, { className: "bg-white dark:bg-gray-800 max-w-md mx-auto", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { className: "text-lg font-semibold text-gray-900 dark:text-white", children: editingGroup ? "Edit Group" : "Add New Group" }), _jsx(DialogDescription, { className: "text-gray-500 dark:text-gray-400", children: editingGroup
                                        ? "Modify the group details below"
                                        : "Fill in the details for your new group" })] }), _jsxs("form", { onSubmit: handleSaveGroup, children: [_jsxs("div", { className: "space-y-4 py-2", children: [_jsxs("div", { className: "mb-4", children: [_jsx(Label, { htmlFor: "group-name", className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Group Name" }), _jsx(Input, { id: "group-name", value: groupFormState.name, onChange: e => setGroupFormState({ ...groupFormState, name: e.target.value }), placeholder: "Enter group name", required: true })] }), _jsxs("div", { className: "mb-4", children: [_jsx(Label, { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Time Range" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("div", { className: "flex-1", children: [_jsx(Label, { htmlFor: "start-time", className: "text-xs mb-1 block", children: "Start Time" }), _jsx(Input, { id: "start-time", type: "time", value: startTime, onChange: e => setStartTime(e.target.value), required: true })] }), _jsx("span", { className: "text-gray-500 dark:text-gray-400 mt-6", children: "to" }), _jsxs("div", { className: "flex-1", children: [_jsx(Label, { htmlFor: "end-time", className: "text-xs mb-1 block", children: "End Time" }), _jsx(Input, { id: "end-time", type: "time", value: endTime, onChange: e => setEndTime(e.target.value), required: true })] })] }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["Preview: ", formatTimeFor12Hour(startTime), " - ", formatTimeFor12Hour(endTime)] })] }), _jsxs("div", { className: "mb-4", children: [_jsx(Label, { htmlFor: "group-icon", className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Icon" }), _jsxs(Select, { value: groupFormState.icon || "fa-layer-group", onValueChange: (val) => setGroupFormState({ ...groupFormState, icon: val }), children: [_jsx(SelectTrigger, { id: "group-icon", children: _jsxs("div", { className: "flex items-center", children: [_jsx("i", { className: getIconClass(groupFormState.icon), style: { marginRight: '8px' } }), _jsx("span", { children: groupFormState.icon === 'fa-layer-group' ? 'General' :
                                                                            groupFormState.icon === 'fa-sun' ? 'Morning' :
                                                                                groupFormState.icon === 'fa-briefcase' ? 'Work' :
                                                                                    groupFormState.icon === 'fa-moon' ? 'Evening' :
                                                                                        groupFormState.icon === 'fa-dumbbell' ? 'Fitness' :
                                                                                            groupFormState.icon === 'fa-book' ? 'Study' : 'Select an icon' })] }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "fa-sun", children: _jsxs("div", { className: "flex items-center", children: [_jsx("i", { className: "fas fa-sun mr-2 text-amber-500" }), _jsx("span", { children: "Morning" })] }) }), _jsx(SelectItem, { value: "fa-briefcase", children: _jsxs("div", { className: "flex items-center", children: [_jsx("i", { className: "fas fa-briefcase mr-2 text-blue-500" }), _jsx("span", { children: "Work" })] }) }), _jsx(SelectItem, { value: "fa-moon", children: _jsxs("div", { className: "flex items-center", children: [_jsx("i", { className: "fas fa-moon mr-2 text-purple-500" }), _jsx("span", { children: "Evening" })] }) }), _jsx(SelectItem, { value: "fa-dumbbell", children: _jsxs("div", { className: "flex items-center", children: [_jsx("i", { className: "fas fa-dumbbell mr-2 text-red-500" }), _jsx("span", { children: "Fitness" })] }) }), _jsx(SelectItem, { value: "fa-book", children: _jsxs("div", { className: "flex items-center", children: [_jsx("i", { className: "fas fa-book mr-2 text-green-500" }), _jsx("span", { children: "Study" })] }) }), _jsx(SelectItem, { value: "fa-layer-group", children: _jsxs("div", { className: "flex items-center", children: [_jsx("i", { className: "fas fa-layer-group mr-2 text-gray-500" }), _jsx("span", { children: "General" })] }) })] })] })] })] }), _jsxs(DialogFooter, { className: "flex justify-end space-x-3 mt-6", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => setIsEditGroupModalOpen(false), disabled: isSubmitting, children: "Cancel" }), _jsx(Button, { type: "submit", disabled: isSubmitting, children: isSubmitting ? "Saving..." : "Save Group" })] })] })] }) }), _jsx(AlertDialog, { open: isDeleteDialogOpen, onOpenChange: setIsDeleteDialogOpen, children: _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: "\u00BFEst\u00E1s seguro?" }), _jsx(AlertDialogDescription, { children: "Esta acci\u00F3n eliminar\u00E1 permanentemente este grupo. Las rutinas asociadas no se eliminar\u00E1n, pero ya no estar\u00E1n vinculadas a este grupo." })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { children: "Cancelar" }), _jsx(AlertDialogAction, { onClick: handleDeleteGroup, className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", children: "Eliminar" })] })] }) })] }));
}
