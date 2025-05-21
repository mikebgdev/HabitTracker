import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Flame, 
  Timer,
  BatteryMedium,
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
  LucideIcon,
  Microscope,
  Music,
  Palette,
  Pen,
  Smartphone,
  Sparkles,
  Utensils,
  Waves
} from "lucide-react";
import type { Group, Routine, InsertRoutine } from "@shared/schema";

interface EditRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  routine?: Routine;
  onRoutineUpdated?: () => Promise<void>;
}

// Lista de iconos disponibles para las rutinas
const ROUTINE_ICONS = [
  { name: "activity", icon: Activity },
  { name: "bike", icon: Bike },
  { name: "book", icon: Book },
  { name: "brain", icon: BrainCircuit },
  { name: "coffee", icon: Coffee },
  { name: "dumbbell", icon: Dumbbell },
  { name: "footprints", icon: Footprints },
  { name: "food", icon: HandPlatter },
  { name: "heart", icon: Heart },
  { name: "laptop", icon: Laptop },
  { name: "microscope", icon: Microscope },
  { name: "music", icon: Music },
  { name: "palette", icon: Palette },
  { name: "pen", icon: Pen },
  { name: "phone", icon: Smartphone },
  { name: "sparkles", icon: Sparkles },
  { name: "utensils", icon: Utensils },
  { name: "waves", icon: Waves }
];

// Mapa de iconos para cada nivel de prioridad
const PRIORITY_ICONS = {
  high: { icon: Flame, color: "text-red-500" },
  medium: { icon: BatteryMedium, color: "text-yellow-500" },
  low: { icon: Timer, color: "text-blue-500" }
};

export function EditRoutineModal({ isOpen, onClose, routine, onRoutineUpdated }: EditRoutineModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [expectedTime, setExpectedTime] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [icon, setIcon] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [selectedDays, setSelectedDays] = useState<Record<string, boolean>>({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [routineId, setRoutineId] = useState<number | null>(null);

  // Cargar los grupos para el desplegable
  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ['/api/groups'],
  });
  
  // Cargar los horarios semanales para la rutina si está siendo editada
  const { data: weekdaySchedule, isLoading: isLoadingSchedule } = useQuery({
    queryKey: ['/api/routines/weekday-schedule', routineId],
    enabled: !!routineId && !isNaN(Number(routineId)), // Añadimos validación para evitar parámetros NaN
  });
  
  // Cargar la relación grupo-rutina para conocer el grupo actual
  const { data: groupRoutines = [] } = useQuery({
    queryKey: ['/api/group-routines'],
    enabled: !!routineId,
  });

  // Inicializar datos al abrir el modal con una rutina para editar
  useEffect(() => {
    if (routine) {
      setName(routine.name);
      setExpectedTime(routine.expectedTime);
      setPriority(routine.priority);
      setIcon(routine.icon || null);
      setRoutineId(routine.id);
      
      // Buscar el grupo al que pertenece esta rutina
      const routineGroup = groupRoutines?.find(gr => gr.routineId === routine.id);
      if (routineGroup) {
        setGroupId(routineGroup.groupId);
      } else {
        setGroupId(null);
      }
      
      // Cargar la programación de días de la semana si existe
      if (weekdaySchedule) {
        setSelectedDays({
          monday: weekdaySchedule.monday,
          tuesday: weekdaySchedule.tuesday,
          wednesday: weekdaySchedule.wednesday,
          thursday: weekdaySchedule.thursday,
          friday: weekdaySchedule.friday,
          saturday: weekdaySchedule.saturday,
          sunday: weekdaySchedule.sunday,
        });
      }
    } else {
      resetForm();
    }
  }, [routine, isOpen, weekdaySchedule, groupRoutines]);

  const toggleDay = (day: string) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Construir los datos para actualizar
      const routineData: Partial<InsertRoutine> & { 
        groupId?: number;
        weekdays?: Record<string, boolean>;
        icon?: string | null;
      } = {
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
        // Actualizar la rutina existente
        await apiRequest("PATCH", `/api/routines/${routineId}`, routineData);
        
        toast({
          title: "Rutina actualizada",
          description: `La rutina "${name}" ha sido actualizada correctamente.`
        });
      } else {
        // Crear una nueva rutina (este caso no debería ocurrir en este modal)
        console.error("Trying to create a routine in update modal");
        return;
      }

      // Actualizar la interfaz
      if (onRoutineUpdated) {
        await onRoutineUpdated();
      }

      onClose();
    } catch (error) {
      console.error("Failed to update routine:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la rutina. Inténtalo de nuevo."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderizar el icono para un nivel de prioridad
  const renderPriorityIcon = (priorityLevel: "high" | "medium" | "low") => {
    const { icon: Icon, color } = PRIORITY_ICONS[priorityLevel];
    return <Icon className={`mr-2 h-4 w-4 inline-flex ${color}`} />;
  };

  // Función para obtener el componente de icono por su nombre
  const getIconComponent = (iconName: string | null): LucideIcon | null => {
    if (!iconName) return null;
    return ROUTINE_ICONS.find(item => item.name === iconName)?.icon || null;
  };

  // Obtener el componente Icon para el icono seleccionado
  const getSelectedIcon = (): LucideIcon | null => {
    if (!icon) return null;
    const found = ROUTINE_ICONS.find(i => i.name === icon);
    return found ? found.icon : null;
  };

  const SelectedIcon = getSelectedIcon();

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="bg-white dark:bg-gray-800 max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            {SelectedIcon && <SelectedIcon className="mr-2 h-5 w-5" />}
            Editar rutina
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            Actualiza los detalles de tu rutina
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="mb-4">
              <Label htmlFor="routine-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre de la rutina
              </Label>
              <Input 
                id="routine-name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nombre de la rutina"
                required
              />
            </div>
            
            <div className="mb-4">
              <Label htmlFor="routine-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tiempo estimado
              </Label>
              <Input 
                id="routine-time"
                type="time"
                value={expectedTime}
                onChange={e => setExpectedTime(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-4">
              <Label htmlFor="routine-group" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Grupo
              </Label>
              <Select 
                value={groupId?.toString() || "none"} 
                onValueChange={(val) => setGroupId(val === "none" ? null : parseInt(val, 10))}
              >
                <SelectTrigger id="routine-group">
                  <SelectValue placeholder="Selecciona un grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ninguno</SelectItem>
                  {groups.map(group => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="mb-4">
              <Label htmlFor="routine-priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prioridad
              </Label>
              <Select value={priority} onValueChange={(val: "high" | "medium" | "low") => setPriority(val)}>
                <SelectTrigger id="routine-priority">
                  <SelectValue placeholder="Selecciona la prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high" className="flex items-center">
                    {renderPriorityIcon("high")}
                    Alta
                  </SelectItem>
                  <SelectItem value="medium" className="flex items-center">
                    {renderPriorityIcon("medium")}
                    Media
                  </SelectItem>
                  <SelectItem value="low" className="flex items-center">
                    {renderPriorityIcon("low")}
                    Baja
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="mb-4">
              <Label htmlFor="routine-icon" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Icono (opcional)
              </Label>
              <Select 
                value={icon || "none"} 
                onValueChange={(val) => setIcon(val === "none" ? null : val)}
              >
                <SelectTrigger id="routine-icon" className="flex items-center">
                  <SelectValue placeholder="Selecciona un ícono">
                    {icon && getIconComponent(icon) ? (
                      <div className="flex items-center">
                        {React.createElement(getIconComponent(icon) as React.ElementType, { 
                          className: "mr-2 h-4 w-4" 
                        })}
                        <span>{icon.charAt(0).toUpperCase() + icon.slice(1)}</span>
                      </div>
                    ) : (
                      "Sin icono"
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="flex items-center">
                    Sin icono
                  </SelectItem>
                  {ROUTINE_ICONS.map(({ name: iconName, icon: Icon }) => (
                    <SelectItem key={iconName} value={iconName} className="flex items-center">
                      <Icon className="mr-2 h-4 w-4" />
                      <span>{iconName.charAt(0).toUpperCase() + iconName.slice(1)}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="mb-4">
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Repetir
              </Label>
              <div className="grid grid-cols-7 gap-1">
                <Toggle 
                  pressed={selectedDays.sunday}
                  onPressedChange={() => toggleDay("sunday")}
                  className={`text-sm font-medium text-center border ${
                    selectedDays.sunday 
                      ? 'bg-primary text-white border-primary shadow-sm' 
                      : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  D
                </Toggle>
                <Toggle 
                  pressed={selectedDays.monday}
                  onPressedChange={() => toggleDay("monday")}
                  className={`text-sm font-medium text-center border ${
                    selectedDays.monday 
                      ? 'bg-primary text-white border-primary shadow-sm' 
                      : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  L
                </Toggle>
                <Toggle 
                  pressed={selectedDays.tuesday}
                  onPressedChange={() => toggleDay("tuesday")}
                  className={`text-sm font-medium text-center border ${
                    selectedDays.tuesday 
                      ? 'bg-primary text-white border-primary shadow-sm' 
                      : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  M
                </Toggle>
                <Toggle 
                  pressed={selectedDays.wednesday}
                  onPressedChange={() => toggleDay("wednesday")}
                  className={`text-sm font-medium text-center border ${
                    selectedDays.wednesday 
                      ? 'bg-primary text-white border-primary shadow-sm' 
                      : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  X
                </Toggle>
                <Toggle 
                  pressed={selectedDays.thursday}
                  onPressedChange={() => toggleDay("thursday")}
                  className={`text-sm font-medium text-center border ${
                    selectedDays.thursday 
                      ? 'bg-primary text-white border-primary shadow-sm' 
                      : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  J
                </Toggle>
                <Toggle 
                  pressed={selectedDays.friday}
                  onPressedChange={() => toggleDay("friday")}
                  className={`text-sm font-medium text-center border ${
                    selectedDays.friday 
                      ? 'bg-primary text-white border-primary shadow-sm' 
                      : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  V
                </Toggle>
                <Toggle 
                  pressed={selectedDays.saturday}
                  onPressedChange={() => toggleDay("saturday")}
                  className={`text-sm font-medium text-center border ${
                    selectedDays.saturday 
                      ? 'bg-primary text-white border-primary shadow-sm' 
                      : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  S
                </Toggle>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-end space-x-3 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}