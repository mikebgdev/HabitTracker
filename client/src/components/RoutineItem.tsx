import React, { useEffect } from 'react';
import { Check, Clock, AlertTriangle, Star } from 'lucide-react';
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
    high: <AlertTriangle className="w-4 h-4" />,
    medium: <Star className="w-4 h-4" />,
    low: <Clock className="w-4 h-4" />
  };
  
  const handleChange = () => {
    if (isEditable) {
      // Llamamos al callback con el nuevo estado invertido
      onToggleCompletion(routine.id, !routine.completed);
    }
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
            <span>{routine.expectedTime}</span>
            
            {routine.completed && (
              <span className="ml-3 text-green-600 dark:text-green-400 flex items-center">
                <Check className="w-3 h-3 mr-1" />
                {routine.completedAt 
                  ? `Completed at ${formatTime(routine.completedAt)}` 
                  : 'Completed'}
              </span>
            )}
          </div>
        </div>
        
        {/* Eliminamos el botón ya que el checkbox cumple la misma función */}
      </div>
    </Card>
  );
}