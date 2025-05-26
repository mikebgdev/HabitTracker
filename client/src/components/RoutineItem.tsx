import React from 'react';
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
  CircleCheckBig,
  FolderOpen,
  Timer
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { formatTime } from '@/lib/date';
import { useQuery } from '@tanstack/react-query';

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

  const { data: groupRoutines = [] } = useQuery({
    queryKey: ['/api/group-routines'],
  });
  
  const { data: groups = [] } = useQuery({
    queryKey: ['/api/groups'],
  });

  const routineGroup = Array.isArray(groupRoutines) 
    ? groupRoutines.find((gr: any) => gr.routineId === routine.id)
    : null;
    
  const group = routineGroup && Array.isArray(groups)
    ? groups.find((g: any) => g.id === routineGroup.groupId) 
    : null;
  
  const priorityColors = {
    high: 'text-red-600 dark:text-red-400',
    medium: 'text-yellow-600 dark:text-yellow-400',
    low: 'text-blue-600 dark:text-blue-400'
  };
  
  const priorityLabels = {
    high: 'Alta',
    medium: 'Media',
    low: 'Baja'
  };
  
  const priorityIcons = {
    high: <Flame className="w-4 h-4" />,
    medium: <BatteryMedium className="w-4 h-4" />,
    low: <Timer className="w-4 h-4" />
  };

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

      onToggleCompletion(routine.id, !routine.completed);
    }
  };

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
          
          <div className="flex items-center flex-wrap gap-2">
            
            <div className="flex items-center mr-1">
              {renderRoutineIcon()}
              <h3 className={`font-medium ${routine.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
                {routine.name}
              </h3>
            </div>
            
            
            <Badge variant="outline" className={`flex items-center px-2 py-0.5 text-xs ${
              routine.priority === 'high' 
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800' 
                : routine.priority === 'medium'
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
            }`}>
              {priorityIcons[routine.priority]}
              <span className="ml-1 font-medium">
                {priorityLabels[routine.priority]}
              </span>
            </Badge>
            
            
            {group && (
              <Badge variant="secondary" className="flex items-center text-xs">
                <FolderOpen className="w-3 h-3 mr-1" />
                <span>{group.name}</span>
              </Badge>
            )}
          </div>
          
          
          <div className="flex flex-wrap items-center mt-2 text-sm text-gray-600 dark:text-gray-400 gap-3">
            
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
              <span>Tiempo: {formatTime(routine.expectedTime)}</span>
            </div>
            
            
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