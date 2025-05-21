import React, { useEffect } from 'react';
import { 
  Check, 
  Clock, 
  AlertTriangle, 
  BatteryMedium, 
  Flame,
  Activity,
  Bike,
  Book,
  BrainCircuit,
  Coffee,
  Dumbbell,
  Footprints,
  HandPlatter,
  Heart,
  Laptop,
  Microscope,
  Music,
  Palette,
  Pen,
  Smartphone,
  Sparkles,
  Utensils,
  Waves,
  LucideIcon,
  CircleCheckBig
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatTime } from '@/lib/date';

interface RoutineItemProps {
  routine: {
    id: number;
    name: string;
    priority: 'high' | 'medium' | 'low';
    expectedTime: string;
    icon?: string | null;
    completed?: boolean;
    completedAt?: string;
  };
  onToggleCompletion: (id: number, completed: boolean) => void;
  isEditable?: boolean;
}

export function RoutineItem({ 
  routine, 
  onToggleCompletion, 
  isEditable = true 
}: RoutineItemProps) {
  // Usamos directamente routine.completed en lugar de un estado local
  // Esto garantiza que siempre refleje el estado actual de los datos
  
  const priorityColors = {
    high: 'text-red-600 dark:text-red-400',
    medium: 'text-yellow-600 dark:text-yellow-400',
    low: 'text-blue-600 dark:text-blue-400'
  };
  
  const priorityIcons = {
    high: <Flame className="w-4 h-4" />,
    medium: <BatteryMedium className="w-4 h-4" />,
    low: <Clock className="w-4 h-4" />
  };
  
  // Mapa de nombres de iconos a componentes de Lucide
  const iconMap: Record<string, LucideIcon> = {
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
  
  const handleChange = () => {
    if (isEditable) {
      // Llamamos al callback con el nuevo estado invertido
      onToggleCompletion(routine.id, !routine.completed);
    }
  };
  
  // Función para renderizar el icono personalizado de la rutina
  const renderRoutineIcon = () => {
    if (!routine.icon) return null;
    
    const IconComponent = iconMap[routine.icon];
    if (!IconComponent) return null;
    
    return <IconComponent className="w-5 h-5 mr-2 text-primary" />;
  };

  return (
    <Card className={`mb-3 hover:shadow transition-all ${
      routine.completed ? 'bg-gray-50 dark:bg-gray-800 opacity-70' : ''
    }`}>
      <div className="p-4 flex items-center">
        <div className="mr-3">
          <Checkbox 
            checked={!!routine.completed} 
            onCheckedChange={handleChange}
            className="h-5 w-5"
            disabled={!isEditable}
          />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center">
            {renderRoutineIcon()}
            <h3 className={`font-medium ${routine.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
              {routine.name}
            </h3>
            <div className={`ml-2 flex items-center ${priorityColors[routine.priority]}`}>
              {priorityIcons[routine.priority]}
              <span className="ml-1 text-xs capitalize">{routine.priority}</span>
            </div>
          </div>
          
          <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3 mr-1" />
            <span>{formatTime(routine.expectedTime)}</span>
            
            {routine.completed && (
              <span className="ml-3 text-green-600 dark:text-green-400 flex items-center">
                <Check className="w-3 h-3 mr-1" />
                {routine.completedAt 
                  ? `Completado a las ${formatTime(routine.completedAt)}` 
                  : 'Completado'}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}