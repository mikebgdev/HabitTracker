import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import Layout from "@/components/Layout";
import { AddRoutineModal } from "@/components/AddRoutineModal";
import { EditRoutineModal } from "@/components/EditRoutineModal";
import { AssignGroupToRoutine } from "@/components/AssignGroupToRoutine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash, Clock, Flame, BatteryMedium, Timer, FolderOpen, Archive, RotateCcw, Activity, Bike, Book, BrainCircuit, Coffee, Dumbbell, Footprints, HandPlatter, Heart, Laptop, Microscope, Music, Palette, Pen, Smartphone, Sparkles, Utensils, Waves } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/contexts/AuthContext";
import { getUserRoutines, getUserGroups, getGroupRoutines, updateRoutine, deleteRoutine, } from "@/lib/firebase";
import { DeleteRoutineDialog } from "@/components/dialogs/DeleteRoutineDialog";
import { WeekdayScheduleDisplay } from "@/components/WeekdayScheduleDisplay";
export default function MyRoutines() {
    const { toast } = useToast();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isAddRoutineModalOpen, setIsAddRoutineModalOpen] = useState(false);
    const [isEditRoutineModalOpen, setIsEditRoutineModalOpen] = useState(false);
    const [isAssignGroupModalOpen, setIsAssignGroupModalOpen] = useState(false);
    const [filter, setFilter] = useState("all");
    const [groupFilter, setGroupFilter] = useState("all");
    const [viewMode, setViewMode] = useState("active");
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [routineToDelete, setRoutineToDelete] = useState(null);
    const [routineToEdit, setRoutineToEdit] = useState(null);
    const { data: routines = [], isLoading, refetch: refetchRoutines, } = useQuery({
        queryKey: ['routines', user?.uid],
        queryFn: () => getUserRoutines(user.uid),
        enabled: !!user,
    });
    const { data: groups = [], refetch: refetchGroups, } = useQuery({
        queryKey: ['groups', user?.uid],
        queryFn: () => getUserGroups(user.uid),
        enabled: !!user,
    });
    const confirmDeleteRoutine = (routine) => {
        setRoutineToDelete(routine);
        setIsDeleteDialogOpen(true);
    };
    const handleArchiveRoutine = async (routineId) => {
        try {
            await updateRoutine(routineId, {
                archived: true,
                archivedAt: new Date().toISOString(),
            });
            queryClient.invalidateQueries({ queryKey: ['routines', user?.uid] });
            toast({
                title: "Rutina archivada",
                description: "La rutina ha sido archivada correctamente y ya no aparecerá en rutinas futuras",
            });
        }
        catch (error) {
            console.error("Failed to archive routine:", error);
            toast({
                title: "Error",
                description: "No se pudo archivar la rutina. Inténtalo de nuevo.",
            });
        }
    };
    const handleUnarchiveRoutine = async (routineId) => {
        try {
            await updateRoutine(routineId, { archived: false });
            queryClient.invalidateQueries({ queryKey: ['routines', user?.uid] });
            toast({
                title: "Rutina desarchivada",
                description: "La rutina ha sido restaurada y volverá a aparecer en rutinas activas",
            });
        }
        catch (error) {
            console.error("Failed to unarchive routine:", error);
            toast({
                title: "Error",
                description: "No se pudo desarchivar la rutina. Inténtalo de nuevo.",
            });
        }
    };
    const handleDeleteRoutine = async () => {
        if (!routineToDelete)
            return;
        try {
            await deleteRoutine(routineToDelete.id);
            queryClient.invalidateQueries({ queryKey: ['routines', user?.uid] });
            queryClient.invalidateQueries({ queryKey: ['groups', user?.uid] });
            toast({
                title: "Rutina eliminada",
                description: "La rutina ha sido eliminada correctamente",
            });
        }
        catch (error) {
            console.error("Failed to delete routine:", error);
            toast({
                title: "Error",
                description: "No se pudo eliminar la rutina. Inténtalo de nuevo.",
            });
        }
        finally {
            setIsDeleteDialogOpen(false);
            setRoutineToDelete(null);
        }
    };
    const { data: groupRoutines = [] } = useQuery({
        queryKey: ['groupRoutines'],
        queryFn: getGroupRoutines,
    });
    const getRoutineGroupInfo = (routineId) => {
        if (!Array.isArray(groupRoutines) || !Array.isArray(groups))
            return null;
        const assignment = groupRoutines.find((gr) => gr.routineId === routineId);
        if (!assignment)
            return null;
        const grp = groups.find((g) => g.id === assignment.groupId);
        if (!grp)
            return null;
        return {
            id: grp.id,
            name: grp.name,
            icon: grp.icon,
        };
    };
    const filteredRoutines = routines.filter(routine => {
        if (viewMode === "active" && routine.archived) {
            return false;
        }
        if (viewMode === "archived" && !routine.archived) {
            return false;
        }
        if (filter !== "all" && routine.priority !== filter) {
            return false;
        }
        if (groupFilter !== "all") {
            const groupInfo = getRoutineGroupInfo(routine.id);
            if (!groupInfo || groupInfo.id !== parseInt(groupFilter)) {
                return false;
            }
        }
        return true;
    });
    const priorityIcons = {
        high: _jsx(Flame, { className: "w-4 h-4 mr-1" }),
        medium: _jsx(BatteryMedium, { className: "w-4 h-4 mr-1" }),
        low: _jsx(Timer, { className: "w-4 h-4 mr-1" })
    };
    const priorityLabels = {
        high: 'Alta',
        medium: 'Media',
        low: 'Baja'
    };
    const iconMap = {
        activity: Activity,
        bike: Bike,
        book: Book,
        brain: BrainCircuit,
        coffee: Coffee,
        dumbbell: Dumbbell,
        footprints: Footprints,
        food: HandPlatter,
        heart: Heart,
        laptop: Laptop,
        microscope: Microscope,
        music: Music,
        palette: Palette,
        pen: Pen,
        phone: Smartphone,
        sparkles: Sparkles,
        utensils: Utensils,
        waves: Waves
    };
    const renderRoutineIcon = (iconName) => {
        if (!iconName)
            return null;
        const IconComponent = iconMap[iconName];
        if (!IconComponent)
            return null;
        return _jsx(IconComponent, { className: "w-5 h-5 mr-2 text-primary" });
    };
    const getPriorityBadgeVariant = (priority) => {
        switch (priority) {
            case "high":
                return "destructive";
            case "medium":
                return "default";
            case "low":
                return "secondary";
            default:
                return "default";
        }
    };
    const formatTime = (timeString) => {
        if (!timeString)
            return '';
        if (timeString.includes(':')) {
            const [hours, minutes] = timeString.split(':');
            const hour = parseInt(hours, 10);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour % 12 || 12;
            return `${hour12}:${minutes || '00'} ${ampm}`;
        }
        return timeString;
    };
    return (_jsxs(Layout, { children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "My Routines" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "View and manage all your routines" })] }), _jsx("div", { className: "mt-4 md:mt-0", children: _jsxs(Button, { onClick: () => setIsAddRoutineModalOpen(true), className: "flex items-center", children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), " Add Routine"] }) })] }), _jsx("div", { className: "mb-6", children: _jsxs("div", { className: "flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg w-fit", children: [_jsx("button", { onClick: () => setViewMode("active"), className: `px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === "active"
                                ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`, children: "Active Routines" }), _jsx("button", { onClick: () => setViewMode("archived"), className: `px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === "archived"
                                ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`, children: "Archived Routines" })] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6", children: _jsxs("div", { className: "flex flex-col md:flex-row gap-4 md:items-center", children: [_jsxs("div", { className: "w-full md:w-1/3", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Filter by Priority" }), _jsxs(Select, { value: filter, onValueChange: setFilter, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select priority" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Priorities" }), _jsx(SelectItem, { value: "high", children: "High Priority" }), _jsx(SelectItem, { value: "medium", children: "Medium Priority" }), _jsx(SelectItem, { value: "low", children: "Low Priority" })] })] })] }), _jsxs("div", { className: "w-full md:w-1/3", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Filter by Group" }), _jsxs(Select, { value: groupFilter, onValueChange: setGroupFilter, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select group" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Groups" }), groups.map(group => (_jsx(SelectItem, { value: group.id.toString(), children: group.name }, group.id)))] })] })] })] }) }), isLoading ? (_jsx("div", { className: "text-center py-8", children: _jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "Loading routines..." }) })) : filteredRoutines.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: filteredRoutines.map((routine) => (_jsxs(Card, { className: "overflow-hidden", children: [_jsx(CardHeader, { className: "p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex gap-3 items-start", children: [_jsx("div", { className: "w-10 h-10 flex items-center justify-center bg-primary-100 dark:bg-primary-800/30 rounded-full text-primary-700 dark:text-primary-300", children: _jsx(Activity, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg font-semibold", children: routine.name }), _jsx("div", { className: "mt-1", children: getRoutineGroupInfo(routine.id) ? (_jsxs(Badge, { variant: "outline", className: "flex items-center text-xs gap-1", children: [_jsx(FolderOpen, { className: "w-3 h-3" }), _jsx("span", { children: getRoutineGroupInfo(routine.id)?.name })] })) : (_jsxs(Badge, { variant: "outline", className: "flex items-center text-xs gap-1 text-gray-400 dark:text-gray-500", children: [_jsx(FolderOpen, { className: "w-3 h-3 opacity-50" }), _jsx("span", { children: "Sin grupo" })] })) })] })] }), _jsxs(Badge, { variant: getPriorityBadgeVariant(routine.priority), className: "flex items-center gap-1", children: [priorityIcons[routine.priority], _jsx("span", { children: priorityLabels[routine.priority] })] })] }) }), _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "mb-4", children: [_jsxs("div", { className: "text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center", children: [_jsx(Clock, { className: "w-4 h-4 mr-1 text-gray-400" }), "Tiempo estimado"] }), _jsx("div", { className: "text-gray-900 dark:text-white font-medium", children: formatTime(routine.expectedTime) })] }), _jsx(WeekdayScheduleDisplay, { routineId: routine.id }), _jsxs("div", { className: "flex justify-end space-x-2 flex-wrap gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", className: "text-gray-700 dark:text-gray-300", onClick: () => {
                                                setRoutineToEdit(routine);
                                                setIsEditRoutineModalOpen(true);
                                            }, children: [_jsx(Edit, { className: "h-4 w-4 mr-1" }), " Editar"] }), viewMode === "active" ? (_jsxs(Button, { variant: "outline", size: "sm", className: "text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20", onClick: () => handleArchiveRoutine(routine.id), children: [_jsx(Archive, { className: "h-4 w-4 mr-1" }), " Archivar"] })) : (_jsxs(Button, { variant: "outline", size: "sm", className: "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20", onClick: () => handleUnarchiveRoutine(routine.id), children: [_jsx(RotateCcw, { className: "h-4 w-4 mr-1" }), " Desarchivar"] })), _jsxs(Button, { variant: "outline", size: "sm", className: "text-red-600 dark:text-red-400", onClick: () => confirmDeleteRoutine(routine), children: [_jsx(Trash, { className: "h-4 w-4 mr-1" }), " Eliminar"] })] })] })] }, routine.id))) })) : (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 dark:text-white mb-2", children: "No routines found" }), filter !== "all" || groupFilter !== "all" ? (_jsx("p", { className: "text-gray-500 dark:text-gray-400 mb-4", children: "Try changing your filter criteria to see more routines." })) : (_jsx("p", { className: "text-gray-500 dark:text-gray-400 mb-4", children: "You haven't created any routines yet. Get started by adding your first routine." })), _jsx(Button, { onClick: () => setIsAddRoutineModalOpen(true), children: "Add Your First Routine" })] })), _jsx("div", { className: "fixed bottom-20 right-4 md:hidden", children: _jsx(Button, { onClick: () => setIsAddRoutineModalOpen(true), className: "rounded-full w-14 h-14 flex items-center justify-center shadow-lg", size: "icon", children: _jsx(Plus, { size: 24 }) }) }), _jsx(AddRoutineModal, { isOpen: isAddRoutineModalOpen, onClose: () => setIsAddRoutineModalOpen(false), onRoutineCreated: async () => {
                    await refetchRoutines();
                    await refetchGroups();
                } }), _jsx(DeleteRoutineDialog, { open: isDeleteDialogOpen, onOpenChange: setIsDeleteDialogOpen, onConfirm: handleDeleteRoutine, routineName: routineToDelete?.name }), _jsx(EditRoutineModal, { isOpen: isEditRoutineModalOpen, onClose: () => {
                    setIsEditRoutineModalOpen(false);
                    setRoutineToEdit(null);
                }, routine: routineToEdit || undefined, onRoutineUpdated: async () => {
                    await refetchRoutines();
                    await refetchGroups();
                } }), _jsx(AssignGroupToRoutine, { isOpen: isAssignGroupModalOpen, onClose: () => {
                    setIsAssignGroupModalOpen(false);
                    setRoutineToEdit(null);
                }, routine: routineToEdit || undefined, onComplete: async () => {
                    await refetchRoutines();
                    await refetchGroups();
                    await queryClient.invalidateQueries({ queryKey: ['groupRoutines'] });
                } })] }));
}
