import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import Layout from '@/components/Layout';
import { AddRoutineModal } from '@/components/AddRoutineModal';
import { EditRoutineModal } from '@/components/EditRoutineModal';
import { AssignGroupToRoutine } from '@/components/AssignGroupToRoutine';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/contexts/AuthContext';
import { getUserRoutines, deleteRoutine } from '@/lib/firebase';
import { DeleteRoutineDialog } from '@/components/dialogs/DeleteRoutineDialog';
import { WeekdayScheduleDisplay } from '@/components/WeekdayScheduleDisplay';
export default function MyRoutines() {
    const { toast } = useToast();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isAddRoutineModalOpen, setIsAddRoutineModalOpen] = useState(false);
    const [isEditRoutineModalOpen, setIsEditRoutineModalOpen] = useState(false);
    const [isAssignGroupModalOpen, setIsAssignGroupModalOpen] = useState(false);
    const [routineToDelete, setRoutineToDelete] = useState(null);
    const [routineToEdit, setRoutineToEdit] = useState(null);
    const { data: routines = [], isLoading, refetch: refetchRoutines, } = useQuery({
        queryKey: ['routines', user?.uid],
        queryFn: () => getUserRoutines(user.uid),
        enabled: !!user,
    });
    const confirmDeleteRoutine = (routine) => {
        setRoutineToDelete(routine);
    };
    const handleDeleteRoutine = async () => {
        if (!routineToDelete)
            return;
        try {
            await deleteRoutine(routineToDelete.id);
            await queryClient.invalidateQueries({
                queryKey: ['routines', user?.uid],
            });
            toast({
                title: 'Rutina eliminada',
                description: 'La rutina ha sido eliminada correctamente',
            });
        }
        catch {
            toast({
                title: 'Error',
                description: 'No se pudo eliminar la rutina. Inténtalo de nuevo.',
            });
        }
        finally {
            setRoutineToDelete(null);
        }
    };
    return (_jsxs(Layout, { children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Mis Rutinas" }), _jsxs(Button, { onClick: () => setIsAddRoutineModalOpen(true), children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), " Agregar Rutina"] })] }), isLoading ? (_jsx("p", { className: "text-center", children: "Cargando rutinas..." })) : routines.length > 0 ? (_jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-4", children: routines.map((routine) => (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: routine.name }) }), _jsx(CardContent, { children: _jsx(WeekdayScheduleDisplay, { routineId: routine.id }) }), _jsxs("div", { className: "flex justify-end gap-2 p-4", children: [_jsxs(Button, { variant: "outline", onClick: () => {
                                        setRoutineToEdit(routine);
                                        setIsEditRoutineModalOpen(true);
                                    }, children: [_jsx(Edit, { className: "mr-1 h-4 w-4" }), " Editar"] }), _jsxs(Button, { variant: "destructive", onClick: () => confirmDeleteRoutine(routine), children: [_jsx(Trash, { className: "mr-1 h-4 w-4" }), " Eliminar"] })] })] }, routine.id))) })) : (_jsx("p", { className: "text-center", children: "No se encontraron rutinas." })), _jsx(AddRoutineModal, { isOpen: isAddRoutineModalOpen, onClose: () => setIsAddRoutineModalOpen(false), onRoutineCreated: async () => {
                    await refetchRoutines();
                } }), _jsx(EditRoutineModal, { isOpen: isEditRoutineModalOpen, onClose: () => {
                    setIsEditRoutineModalOpen(false);
                    setRoutineToEdit(null);
                }, routine: routineToEdit || undefined, onRoutineUpdated: async () => {
                    await refetchRoutines();
                } }), _jsx(DeleteRoutineDialog, { open: !!routineToDelete, onOpenChange: (open) => {
                    if (!open)
                        setRoutineToDelete(null);
                }, onConfirm: handleDeleteRoutine, routineName: routineToDelete?.name }), _jsx(AssignGroupToRoutine, { isOpen: isAssignGroupModalOpen, onClose: () => setIsAssignGroupModalOpen(false), routine: routineToEdit || undefined, onComplete: refetchRoutines })] }));
}
