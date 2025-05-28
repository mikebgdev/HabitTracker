import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { addGroup, addRoutine, getUserGroups } from "@/lib/firebase";
import { useToast } from "@/hooks/useToast";
export function AddRoutineModal({ isOpen, onClose, onRoutineCreated }) {
    const { toast } = useToast();
    const [name, setName] = useState("");
    const [expectedTime, setExpectedTime] = useState("");
    const [priority, setPriority] = useState("medium");
    const [groupId, setGroupId] = useState(null);
    const [newGroupName, setNewGroupName] = useState("");
    const [showNewGroupInput, setShowNewGroupInput] = useState(false);
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
    const { user } = useAuth();
    const client = useQueryClient();
    const { data: groups = [] } = useQuery({
        queryKey: ['groups'],
        queryFn: () => getUserGroups(user?.uid || ''),
        enabled: !!user,
    });
    const toggleDay = (day) => {
        setSelectedDays(prev => ({
            ...prev,
            [day]: !prev[day]
        }));
    };
    const handleGroupChange = (value) => {
        if (value === "new") {
            setShowNewGroupInput(true);
            setGroupId(null);
        }
        else {
            setShowNewGroupInput(false);
            setGroupId(value);
        }
    };
    const resetForm = () => {
        setName("");
        setExpectedTime("");
        setPriority("medium");
        setGroupId(null);
        setNewGroupName("");
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
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let finalGroupId = groupId;
            if (showNewGroupInput && newGroupName && user) {
                finalGroupId = await addGroup({ name: newGroupName, userId: user.uid });
            }
            const routineData = {
                name,
                expectedTime,
                priority,
            };
            if (finalGroupId) {
                routineData.groupId = finalGroupId;
            }
            routineData.weekdays = selectedDays;
            if (user) {
                const newId = await addRoutine({ ...routineData, userId: user.uid });
                // newRoutine id: newId
            }
            toast({
                title: "Rutina creada",
                description: `La rutina "${name}" ha sido creada correctamente.`
            });
            if (onRoutineCreated) {
                await onRoutineCreated();
            }
            else {
                await client.invalidateQueries({ queryKey: ['routines'] });
                await client.invalidateQueries({ queryKey: ['groups'] });
                await client.invalidateQueries({ queryKey: ['routines', 'daily'] });
            }
            resetForm();
            onClose();
        }
        catch (error) {
            console.error("Failed to create routine:", error);
            toast({
                title: "Error",
                description: "No se pudo crear la rutina. Inténtalo de nuevo."
            });
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: open => !open && onClose(), children: _jsxs(DialogContent, { className: "bg-white dark:bg-gray-800 max-w-md mx-auto", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "Add New Routine" }), _jsx(DialogDescription, { className: "text-gray-500 dark:text-gray-400", children: "Create a new routine to track daily habits" })] }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "space-y-4 py-2", children: [_jsxs("div", { className: "mb-4", children: [_jsx(Label, { htmlFor: "routine-name", className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Routine Name" }), _jsx(Input, { id: "routine-name", value: name, onChange: e => setName(e.target.value), placeholder: "Enter routine name", required: true })] }), _jsxs("div", { className: "mb-4", children: [_jsx(Label, { htmlFor: "routine-time", className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Expected Time (Optional)" }), _jsx(Input, { id: "routine-time", type: "time", value: expectedTime, onChange: e => setExpectedTime(e.target.value), placeholder: "Optional" })] }), _jsxs("div", { className: "mb-4", children: [_jsx(Label, { htmlFor: "routine-group", className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Group" }), _jsxs(Select, { onValueChange: handleGroupChange, children: [_jsx(SelectTrigger, { id: "routine-group", children: _jsx(SelectValue, { placeholder: "Select a group" }) }), _jsxs(SelectContent, { children: [groups.map(group => (_jsx(SelectItem, { value: group.id.toString(), children: group.name }, group.id))), _jsx(SelectItem, { value: "new", children: "Create New Group..." })] })] }), showNewGroupInput && (_jsx("div", { className: "mt-2", children: _jsx(Input, { value: newGroupName, onChange: e => setNewGroupName(e.target.value), placeholder: "Enter new group name", className: "mt-1", required: showNewGroupInput }) }))] }), _jsxs("div", { className: "mb-4", children: [_jsx(Label, { htmlFor: "routine-priority", className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Priority" }), _jsxs(Select, { defaultValue: priority, onValueChange: (val) => setPriority(val), children: [_jsx(SelectTrigger, { id: "routine-priority", children: _jsx(SelectValue, { placeholder: "Select priority" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "high", children: "High" }), _jsx(SelectItem, { value: "medium", children: "Medium" }), _jsx(SelectItem, { value: "low", children: "Low" })] })] })] }), _jsxs("div", { className: "mb-4", children: [_jsx(Label, { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Repeat" }), _jsxs("div", { className: "grid grid-cols-7 gap-1", children: [_jsx(Toggle, { variant: selectedDays.monday ? "selected" : "day", pressed: selectedDays.monday, onPressedChange: () => toggleDay("monday"), className: `text-xs font-medium text-center ${selectedDays.monday
                                                        ? "bg-blue-500 text-white dark:bg-blue-600"
                                                        : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"}`, children: "L" }), _jsx(Toggle, { variant: selectedDays.tuesday ? "selected" : "day", pressed: selectedDays.tuesday, onPressedChange: () => toggleDay("tuesday"), className: `text-xs font-medium text-center ${selectedDays.tuesday
                                                        ? "bg-blue-500 text-white dark:bg-blue-600"
                                                        : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"}`, children: "M" }), _jsx(Toggle, { variant: selectedDays.wednesday ? "selected" : "day", pressed: selectedDays.wednesday, onPressedChange: () => toggleDay("wednesday"), className: `text-xs font-medium text-center ${selectedDays.wednesday
                                                        ? "bg-blue-500 text-white dark:bg-blue-600"
                                                        : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"}`, children: "X" }), _jsx(Toggle, { variant: selectedDays.thursday ? "selected" : "day", pressed: selectedDays.thursday, onPressedChange: () => toggleDay("thursday"), className: `text-xs font-medium text-center ${selectedDays.thursday
                                                        ? "bg-blue-500 text-white dark:bg-blue-600"
                                                        : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"}`, children: "J" }), _jsx(Toggle, { variant: selectedDays.friday ? "selected" : "day", pressed: selectedDays.friday, onPressedChange: () => toggleDay("friday"), className: `text-xs font-medium text-center ${selectedDays.friday
                                                        ? "bg-blue-500 text-white dark:bg-blue-600"
                                                        : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"}`, children: "V" }), _jsx(Toggle, { variant: selectedDays.saturday ? "selected" : "day", pressed: selectedDays.saturday, onPressedChange: () => toggleDay("saturday"), className: `text-xs font-medium text-center ${selectedDays.saturday
                                                        ? "bg-blue-500 text-white dark:bg-blue-600"
                                                        : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"}`, children: "S" }), _jsx(Toggle, { variant: selectedDays.sunday ? "selected" : "day", pressed: selectedDays.sunday, onPressedChange: () => toggleDay("sunday"), className: `text-xs font-medium text-center ${selectedDays.sunday
                                                        ? "bg-blue-500 text-white dark:bg-blue-600"
                                                        : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"}`, children: "D" })] })] })] }), _jsxs(DialogFooter, { className: "flex justify-end space-x-3 mt-6", children: [_jsx(Button, { type: "button", variant: "outline", onClick: onClose, disabled: isSubmitting, children: "Cancel" }), _jsx(Button, { type: "submit", disabled: isSubmitting, children: isSubmitting ? "Saving..." : "Save Routine" })] })] })] }) }));
}
