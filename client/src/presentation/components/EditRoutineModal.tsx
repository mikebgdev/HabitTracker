import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/presentation/components/ui/dialog";
import { Button } from "@/presentation/components/ui/button";
import { Label } from "@/presentation/components/ui/label";
import { Input } from "@/presentation/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/presentation/components/ui/select";
import { Toggle } from "@/presentation/components/ui/toggle";
import { apiRequest } from "@/infrastructure/api/queryClient";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/application/use-cases/use-toast";
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

  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ['/api/groups'],
  });

  const { data: weekdaySchedule, isLoading: isLoadingSchedule } = useQuery({
    queryKey: ['/api/routines/weekday-schedule', routineId],
    enabled: !!routineId && !isNaN(Number(routineId)), 
  });

  const { data: groupRoutines = [] } = useQuery({
    queryKey: ['/api/group-routines'],
    enabled: !!routineId,
  });


  useEffect(() => {
    if (routine) {
      setName(routine.name);
      setExpectedTime(routine.expectedTime);
      setPriority(routine.priority);
      setIcon(routine.icon || null);
      setRoutineId(routine.id);
    } else {
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

        await apiRequest("PATCH", `/api/routines/${routineId}`, routineData);
        
        toast({
          title: "Rutina actualizada",
          description: `La rutina "${name}" ha sido actualizada correctamente.`
        });
      } else {

        console.error("Trying to create a routine in update modal");
        return;
      }

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

  const renderPriorityIcon = (priorityLevel: "high" | "medium" | "low") => {
    const { icon: Icon, color } = PRIORITY_ICONS[priorityLevel];
    return <Icon className={`mr-2 h-4 w-4 inline-flex ${color}`} />;
  };

  const getIconComponent = (iconName: string | null): LucideIcon | null => {
    if (!iconName) return null;
    return ROUTINE_ICONS.find(item => item.name === iconName)?.icon || null;
  };

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
                Tiempo estimado (Opcional)
              </Label>
              <Input 
                id="routine-time"
                type="time"
                value={expectedTime}
                onChange={e => setExpectedTime(e.target.value)}
                placeholder="Opcional"
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
                  <SelectItem value="high">
                    <div className="flex items-center">
                      {React.createElement(PRIORITY_ICONS["high"].icon, { 
                        className: `mr-2 h-4 w-4 ${PRIORITY_ICONS["high"].color}` 
                      })}
                      <span>Alta</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center">
                      {React.createElement(PRIORITY_ICONS["medium"].icon, { 
                        className: `mr-2 h-4 w-4 ${PRIORITY_ICONS["medium"].color}` 
                      })}
                      <span>Media</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="low">
                    <div className="flex items-center">
                      {React.createElement(PRIORITY_ICONS["low"].icon, { 
                        className: `mr-2 h-4 w-4 ${PRIORITY_ICONS["low"].color}` 
                      })}
                      <span>Baja</span>
                    </div>
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
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="none" className="flex items-center gap-2">
                    <div className="w-4 h-4 mr-2"></div>
                    <span>Sin icono</span>
                  </SelectItem>
                  
                  {ICON_CATEGORIES.map((category) => (
                    <div key={category.name}>
                      <div className="px-2 py-1.5 text-sm font-semibold text-gray-500 dark:text-gray-400 border-t mt-1">
                        {category.name}
                      </div>
                      {category.icons.map(({ name: iconName, icon: Icon, label }) => (
                        <SelectItem key={iconName} value={iconName} className="flex items-center gap-2">
                          <div className="flex items-center">
                            <Icon className="h-4 w-4 mr-2" />
                            <span>{label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </div>
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