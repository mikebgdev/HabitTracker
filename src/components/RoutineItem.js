import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Clock, AlertTriangle, BatteryMedium, Flame, Activity, Bike, Book, BrainCircuit, Coffee, Dumbbell, Footprints, HandPlatter, Heart, Laptop, Microscope, Music, Palette, Pen, Smartphone, Sparkles, Utensils, Waves, CircleCheckBig, FolderOpen, Timer, } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { formatTime } from '@/lib/date';
import { useQuery } from '@tanstack/react-query';
import { getUserGroups } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
export function RoutineItem({ routine, onToggleCompletion, isEditable = true, }) {
    const { user } = useAuth();
    const { data: groups = [] } = useQuery({
        queryKey: ['groups'],
        queryFn: () => getUserGroups(user?.uid || ''),
        enabled: !!user,
    });
    const group = groups.find((g) => g.id === routine.groupId);
    const priorityLabels = {
        high: 'Alta',
        medium: 'Media',
        low: 'Baja',
    };
    const priorityIcons = {
        high: _jsx(Flame, { className: "w-4 h-4" }),
        medium: _jsx(BatteryMedium, { className: "w-4 h-4" }),
        low: _jsx(Timer, { className: "w-4 h-4" }),
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
        waves: Waves,
    };
    const handleChange = () => {
        if (isEditable) {
            onToggleCompletion(routine.id, !routine.completed);
        }
    };
    const renderRoutineIcon = () => {
        if (!routine.icon)
            return null;
        const IconComponent = iconMap[routine.icon];
        return IconComponent ? (_jsx(IconComponent, { className: "w-5 h-5 mr-2 text-primary" })) : null;
    };
    return (_jsx(Card, { className: `mb-3 hover:shadow transition-all ${routine.completed ? 'bg-gray-50 dark:bg-gray-800 opacity-70' : ''}`, children: _jsxs("div", { className: "p-4 flex items-center", children: [_jsx("div", { className: "mr-3", children: _jsx(Checkbox, { checked: !!routine.completed, onCheckedChange: handleChange, className: "h-5 w-5", disabled: !isEditable }) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center flex-wrap gap-2", children: [_jsxs("div", { className: "flex items-center mr-1", children: [renderRoutineIcon(), _jsx("h3", { className: `font-medium ${routine.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`, children: routine.name })] }), _jsxs(Badge, { variant: "outline", className: `flex items-center px-2 py-0.5 text-xs ${routine.priority === 'high'
                                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                                        : routine.priority === 'medium'
                                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
                                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'}`, children: [priorityIcons[routine.priority], _jsx("span", { className: "ml-1 font-medium", children: priorityLabels[routine.priority] })] }), group && (_jsxs(Badge, { variant: "secondary", className: "flex items-center text-xs", children: [_jsx(FolderOpen, { className: "w-3 h-3 mr-1" }), _jsx("span", { children: group.name })] }))] }), _jsxs("div", { className: "flex flex-wrap items-center mt-2 text-sm text-gray-600 dark:text-gray-400 gap-3", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Clock, { className: "w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" }), _jsxs("span", { children: ["Tiempo: ", formatTime(routine.expectedTime)] })] }), routine.completed ? (_jsxs("div", { className: "flex items-center text-green-600 dark:text-green-400", children: [_jsx(CircleCheckBig, { className: "w-4 h-4 mr-1" }), _jsx("span", { children: routine.completedAt
                                                ? `Completado a las ${formatTime(routine.completedAt)}`
                                                : 'Completado' })] })) : (_jsxs("div", { className: "flex items-center text-gray-500 dark:text-gray-400", children: [_jsx(AlertTriangle, { className: "w-4 h-4 mr-1" }), _jsx("span", { children: "Pendiente" })] }))] })] })] }) }));
}
