import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getUserGroups, getGroupRoutines, assignGroupToRoutine, removeGroupRoutine, } from "@/lib/firebase";
import { useToast } from "@/hooks/useToast";
export function AssignGroupToRoutine({ isOpen, onClose, routine, onComplete }) {
    const { toast } = useToast();
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAuth();
    const client = useQueryClient();
    const { data: groups = [] } = useQuery(['groups'], () => getUserGroups(user?.uid || ''), { enabled: !!user });
    const { data: groupRoutines = [], isLoading: isLoadingGroupRoutines } = useQuery(['groupRoutines'], getGroupRoutines, { enabled: !!routine });
    useEffect(() => {
        if (routine && groupRoutines.length > 0) {
            const routineGroup = groupRoutines.find((gr) => gr.routineId === routine.id);
            if (routineGroup) {
                setSelectedGroupId(routineGroup.groupId.toString());
            }
            else {
                setSelectedGroupId(null);
            }
        }
    }, [routine?.id, groupRoutines]);
    const assignMutation = useMutation(async () => {
        if (!routine || !user)
            return;
        if (selectedGroupId) {
            await assignGroupToRoutine({
                routineId: routine.id,
                groupId: parseInt(selectedGroupId, 10),
            });
        }
        else {
            // remove any existing assignment
            const existing = groupRoutines.find((gr) => gr.routineId === routine.id);
            if (existing) {
                await removeGroupRoutine(existing.id);
            }
        }
    }, {
        onSuccess: () => {
            toast({
                title: "Grupo asignado",
                description: selectedGroupId
                    ? `La rutina ha sido asignada al grupo correctamente.`
                    : `La rutina ha sido removida del grupo.`,
            });
            client.invalidateQueries(['routines']);
            client.invalidateQueries(['groupRoutines']);
            client.invalidateQueries(['groups']);
            onComplete?.();
            onClose();
        },
        onError: (error) => {
            console.error("Error assigning group:", error);
            toast({
                title: "Error",
                description: "No se pudo asignar el grupo a la rutina. Inténtalo de nuevo.",
            });
        },
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        assignMutation.mutate();
        setIsSubmitting(false);
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: open => !open && onClose(), children: _jsxs(DialogContent, { className: "bg-white dark:bg-gray-800 max-w-md mx-auto", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "Asignar a Grupo" }), _jsx(DialogDescription, { className: "text-gray-500 dark:text-gray-400", children: "Selecciona un grupo para asignar esta rutina o d\u00E9jalo vac\u00EDo para no asignarla a ning\u00FAn grupo." })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 mt-4", children: [_jsx("div", { className: "space-y-2", children: _jsxs(Select, { value: selectedGroupId || "", onValueChange: setSelectedGroupId, children: [_jsx(SelectTrigger, { className: "w-full", children: _jsx(SelectValue, { placeholder: "Seleccionar grupo" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "", children: "Sin grupo" }), groups.map((group) => (_jsx(SelectItem, { value: group.id.toString(), children: group.name }, group.id)))] })] }) }), _jsxs(DialogFooter, { className: "flex justify-end gap-2 mt-6", children: [_jsx(Button, { type: "button", variant: "outline", onClick: onClose, className: "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700", children: "Cancelar" }), _jsx(Button, { type: "submit", disabled: isSubmitting, className: "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700", children: isSubmitting ? "Guardando..." : "Guardar" })] })] })] }) }));
}
