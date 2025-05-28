import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getUserGroups, getGroupRoutines, getWeekdaySchedule, updateWeekdaySchedule, updateRoutine, } from "@/lib/firebase";
import { useToast } from "@/hooks/useToast";
import { Flame, Timer, BatteryMedium, Activity, Bike, Book, BrainCircuit, Coffee, Dumbbell, Footprints, HandPlatter, Heart, Laptop, Microscope, Music, Palette, Pen, Smartphone, Sparkles, Utensils, Waves } from "lucide-react";
const ICON_CATEGORIES = [
    {
        name: "Actividades",
        icons: [
            { name: "activity", icon: Activity, label: "Actividad" },
            { name: "bike", icon: Bike, label: "Bicicleta" },
            { name: "footprints", icon: Footprints, label: "Caminar" },
            { name: "dumbbell", icon: Dumbbell, label: "Ejercicio" },
            { name: "palette", icon: Palette, label: "Arte" },
            { name: "music", icon: Music, label: "Música" },
            { name: "waves", icon: Waves, label: "Relajación" }
        ]
    },
    {
        name: "Trabajo y Estudio",
        icons: [
            { name: "book", icon: Book, label: "Lectura" },
            { name: "brain", icon: BrainCircuit, label: "Aprendizaje" },
            { name: "laptop", icon: Laptop, label: "Computadora" },
            { name: "microscope", icon: Microscope, label: "Ciencia" },
            { name: "pen", icon: Pen, label: "Escritura" },
            { name: "phone", icon: Smartphone, label: "Celular" }
        ]
    },
    {
        name: "Salud y Bienestar",
        icons: [
            { name: "coffee", icon: Coffee, label: "Café" },
            { name: "food", icon: HandPlatter, label: "Comida" },
            { name: "heart", icon: Heart, label: "Salud" },
            { name: "sparkles", icon: Sparkles, label: "Bienestar" },
            { name: "utensils", icon: Utensils, label: "Alimentación" }
        ]
    }
];
const ROUTINE_ICONS = ICON_CATEGORIES.flatMap(category => category.icons);
const PRIORITY_ICONS = {
    high: { icon: Flame, color: "text-red-500" },
    medium: { icon: BatteryMedium, color: "text-yellow-500" },
    low: { icon: Timer, color: "text-blue-500" }
};
export function EditRoutineModal({ isOpen, onClose, routine, onRoutineUpdated }) {
    const { toast } = useToast();
    const [name, setName] = useState("");
    const [expectedTime, setExpectedTime] = useState("");
    const [priority, setPriority] = useState("medium");
    const [icon, setIcon] = useState(null);
    const [groupId, setGroupId] = useState(null);
    const [selectedDays, setSelectedDays] = useState({
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [routineId, setRoutineId] = useState(null);
    const { user } = useAuth();
    const client = useQueryClient();
    const { data: groups = [] } = useQuery(['groups'], () => getUserGroups(user?.uid || ''), { enabled: !!user });
    const { data: weekdaySchedule, isLoading: isLoadingSchedule } = useQuery(['weekdaySchedule', routineId], () => getWeekdaySchedule(routineId), { enabled: !!routineId });
    const { data: groupRoutines = [] } = useQuery(['groupRoutines'], getGroupRoutines, { enabled: !!routine });
    useEffect(() => {
        if (routine) {
            setName(routine.name);
            setExpectedTime(routine.expectedTime);
            setPriority(routine.priority);
            setIcon(routine.icon || null);
            setRoutineId(routine.id);
        }
        else {
            resetForm();
        }
    }, [routine, isOpen]);
    useEffect(() => {
        if (routine && Array.isArray(groupRoutines) && groupRoutines.length > 0) {
            let foundGroup = false;
            for (const gr of groupRoutines) {
                if (gr.routineId === routine.id) {
                    setGroupId(gr.groupId);
                    foundGroup = true;
                    break;
                }
            }
            if (!foundGroup) {
                setGroupId(null);
            }
        }
    }, [routine?.id, groupRoutines]);
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
    const toggleDay = (day) => {
        setSelectedDays(prev => ({
            ...prev,
            [day]: !prev[day]
        }));
    };
    const resetForm = () => {
        setName("");
        setExpectedTime("");
        setPriority("medium");
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
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const routineData = {
                name,
                expectedTime,
                priority,
                icon
            };
            if (groupId) {
                routineData.groupId = groupId;
            }
            routineData.weekdays = selectedDays;
            if (routineId) {
                await updateRoutine(routineId, routineData);
                await updateWeekdaySchedule(routineId, selectedDays);
                toast({
                    title: "Rutina actualizada",
                    description: `La rutina "${name}" ha sido actualizada correctamente.`,
                });
            }
            else {
                console.error("Trying to update routine without ID");
                return;
            }
            if (onRoutineUpdated) {
                await onRoutineUpdated();
            }
            onClose();
        }
        catch (error) {
            console.error("Failed to update routine:", error);
            toast({
                title: "Error",
                description: "No se pudo actualizar la rutina. Inténtalo de nuevo."
            });
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const renderPriorityIcon = (priorityLevel) => {
        const { icon: Icon, color } = PRIORITY_ICONS[priorityLevel];
        return _jsx(Icon, { className: `mr-2 h-4 w-4 inline-flex ${color}` });
    };
    const getIconComponent = (iconName) => {
        if (!iconName)
            return null;
        return ROUTINE_ICONS.find(item => item.name === iconName)?.icon || null;
    };
    const getSelectedIcon = () => {
        if (!icon)
            return null;
        const found = ROUTINE_ICONS.find(i => i.name === icon);
        return found ? found.icon : null;
    };
    const SelectedIcon = getSelectedIcon();
    return (_jsx(Dialog, { open: isOpen, onOpenChange: open => !open && onClose(), children: _jsxs(DialogContent, { className: "bg-white dark:bg-gray-800 max-w-md mx-auto", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: "text-lg font-semibold text-gray-900 dark:text-white flex items-center", children: [SelectedIcon && _jsx(SelectedIcon, { className: "mr-2 h-5 w-5" }), "Editar rutina"] }), _jsx(DialogDescription, { className: "text-gray-500 dark:text-gray-400", children: "Actualiza los detalles de tu rutina" })] }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "space-y-4 py-2", children: [_jsxs("div", { className: "mb-4", children: [_jsx(Label, { htmlFor: "routine-name", className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Nombre de la rutina" }), _jsx(Input, { id: "routine-name", value: name, onChange: e => setName(e.target.value), placeholder: "Nombre de la rutina", required: true })] }), _jsxs("div", { className: "mb-4", children: [_jsx(Label, { htmlFor: "routine-time", className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Tiempo estimado (Opcional)" }), _jsx(Input, { id: "routine-time", type: "time", value: expectedTime, onChange: e => setExpectedTime(e.target.value), placeholder: "Opcional" })] }), _jsxs("div", { className: "mb-4", children: [_jsx(Label, { htmlFor: "routine-group", className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Grupo" }), _jsxs(Select, { value: groupId?.toString() || "none", onValueChange: (val) => setGroupId(val === "none" ? null : parseInt(val, 10)), children: [_jsx(SelectTrigger, { id: "routine-group", children: _jsx(SelectValue, { placeholder: "Selecciona un grupo" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "none", children: "Ninguno" }), groups.map(group => (_jsx(SelectItem, { value: group.id.toString(), children: group.name }, group.id)))] })] })] }), _jsxs("div", { className: "mb-4", children: [_jsx(Label, { htmlFor: "routine-priority", className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Prioridad" }), _jsxs(Select, { value: priority, onValueChange: (val) => setPriority(val), children: [_jsx(SelectTrigger, { id: "routine-priority", children: _jsx(SelectValue, { placeholder: "Selecciona la prioridad" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "high", children: _jsxs("div", { className: "flex items-center", children: [React.createElement(PRIORITY_ICONS["high"].icon, {
                                                                        className: `mr-2 h-4 w-4 ${PRIORITY_ICONS["high"].color}`
                                                                    }), _jsx("span", { children: "Alta" })] }) }), _jsx(SelectItem, { value: "medium", children: _jsxs("div", { className: "flex items-center", children: [React.createElement(PRIORITY_ICONS["medium"].icon, {
                                                                        className: `mr-2 h-4 w-4 ${PRIORITY_ICONS["medium"].color}`
                                                                    }), _jsx("span", { children: "Media" })] }) }), _jsx(SelectItem, { value: "low", children: _jsxs("div", { className: "flex items-center", children: [React.createElement(PRIORITY_ICONS["low"].icon, {
                                                                        className: `mr-2 h-4 w-4 ${PRIORITY_ICONS["low"].color}`
                                                                    }), _jsx("span", { children: "Baja" })] }) })] })] })] }), _jsxs("div", { className: "mb-4", children: [_jsx(Label, { htmlFor: "routine-icon", className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Icono (opcional)" }), _jsxs(Select, { value: icon || "none", onValueChange: (val) => setIcon(val === "none" ? null : val), children: [_jsx(SelectTrigger, { id: "routine-icon", className: "flex items-center", children: _jsx(SelectValue, { placeholder: "Selecciona un \u00EDcono", children: icon && getIconComponent(icon) ? (_jsxs("div", { className: "flex items-center", children: [React.createElement(getIconComponent(icon), {
                                                                    className: "mr-2 h-4 w-4"
                                                                }), _jsx("span", { children: icon.charAt(0).toUpperCase() + icon.slice(1) })] })) : ("Sin icono") }) }), _jsxs(SelectContent, { className: "max-h-[300px]", children: [_jsxs(SelectItem, { value: "none", className: "flex items-center gap-2", children: [_jsx("div", { className: "w-4 h-4 mr-2" }), _jsx("span", { children: "Sin icono" })] }), ICON_CATEGORIES.map((category) => (_jsxs("div", { children: [_jsx("div", { className: "px-2 py-1.5 text-sm font-semibold text-gray-500 dark:text-gray-400 border-t mt-1", children: category.name }), category.icons.map(({ name: iconName, icon: Icon, label }) => (_jsx(SelectItem, { value: iconName, className: "flex items-center gap-2", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Icon, { className: "h-4 w-4 mr-2" }), _jsx("span", { children: label })] }) }, iconName)))] }, category.name)))] })] })] }), _jsxs("div", { className: "mb-4", children: [_jsx(Label, { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Repetir" }), _jsxs("div", { className: "grid grid-cols-7 gap-1", children: [_jsx(Toggle, { pressed: selectedDays.monday, onPressedChange: () => toggleDay("monday"), className: `text-sm font-medium text-center border ${selectedDays.monday
                                                        ? 'bg-primary text-white border-primary shadow-sm'
                                                        : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`, children: "L" }), _jsx(Toggle, { pressed: selectedDays.tuesday, onPressedChange: () => toggleDay("tuesday"), className: `text-sm font-medium text-center border ${selectedDays.tuesday
                                                        ? 'bg-primary text-white border-primary shadow-sm'
                                                        : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`, children: "M" }), _jsx(Toggle, { pressed: selectedDays.wednesday, onPressedChange: () => toggleDay("wednesday"), className: `text-sm font-medium text-center border ${selectedDays.wednesday
                                                        ? 'bg-primary text-white border-primary shadow-sm'
                                                        : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`, children: "X" }), _jsx(Toggle, { pressed: selectedDays.thursday, onPressedChange: () => toggleDay("thursday"), className: `text-sm font-medium text-center border ${selectedDays.thursday
                                                        ? 'bg-primary text-white border-primary shadow-sm'
                                                        : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`, children: "J" }), _jsx(Toggle, { pressed: selectedDays.friday, onPressedChange: () => toggleDay("friday"), className: `text-sm font-medium text-center border ${selectedDays.friday
                                                        ? 'bg-primary text-white border-primary shadow-sm'
                                                        : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`, children: "V" }), _jsx(Toggle, { pressed: selectedDays.saturday, onPressedChange: () => toggleDay("saturday"), className: `text-sm font-medium text-center border ${selectedDays.saturday
                                                        ? 'bg-primary text-white border-primary shadow-sm'
                                                        : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`, children: "S" }), _jsx(Toggle, { pressed: selectedDays.sunday, onPressedChange: () => toggleDay("sunday"), className: `text-sm font-medium text-center border ${selectedDays.sunday
                                                        ? 'bg-primary text-white border-primary shadow-sm'
                                                        : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`, children: "D" })] })] })] }), _jsxs(DialogFooter, { className: "flex justify-end space-x-3 mt-6", children: [_jsx(Button, { type: "button", variant: "outline", onClick: onClose, disabled: isSubmitting, children: "Cancelar" }), _jsx(Button, { type: "submit", disabled: isSubmitting, children: isSubmitting ? "Guardando..." : "Guardar cambios" })] })] })] }) }));
}
