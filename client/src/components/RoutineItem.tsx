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
          <div className="flex items-center flex-wrap">
            {/* Icono + nombre */}
            <div className="flex items-center mr-3">
              {renderRoutineIcon()}
              <h3 className={`font-medium ${routine.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
                {routine.name}
              </h3>
            </div>
            
            {/* Indicador de prioridad */}
            <div className={`flex items-center px-2 py-0.5 rounded-full text-xs ${
              routine.priority === 'high' 
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' 
                : routine.priority === 'medium'
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
            }`}>
              {priorityIcons[routine.priority]}
              <span className="ml-1 font-medium">
                {routine.priority === 'high' ? 'Alta' : routine.priority === 'medium' ? 'Media' : 'Baja'}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
            {/* Tiempo estimado */}
            <div className="flex items-center mr-4">
              <Clock className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
              <span>Tiempo: {formatTime(routine.expectedTime)}</span>
            </div>
            
            {/* Estado de completado */}
            {routine.completed ? (
              <div className="flex items-center text-green-600 dark:text-green-400">
                <CircleCheckBig className="w-4 h-4 mr-1" />
                <span>
                  {routine.completedAt 
                    ? `Completado a las ${formatTime(routine.completedAt)}` 
                    : 'Completado'}
                </span>
              </div>
            ) : (
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <AlertTriangle className="w-4 h-4 mr-1" />
                <span>Pendiente</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}