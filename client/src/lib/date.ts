import { format, formatDistanceToNow, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Format a date for display
 * @param date The date to format
 * @param formatStr Optional format string
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string, formatStr?: string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr || 'PP', { locale: es });
};

/**
 * Format a time in 24-hour format (HH:MM) to 12-hour format with AM/PM
 * @param timeString Time string in HH:MM format
 * @returns Time in 12-hour format with AM/PM
 */
export const formatTime = (timeString: string): string => {
  if (!timeString) {
    return 'Hora no disponible';
  }

  try {
    // If input is a full ISO date string, extract just the time part
    if (timeString.includes('T')) {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) {
        return 'Formato inválido';
      }
      return format(date, 'h:mm a', { locale: es });
    }
    
    // Otherwise parse as HH:MM
    const parts = timeString.split(':');
    if (parts.length < 2) {
      return 'Formato inválido';
    }
    
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return 'Formato inválido';
    }
    
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    
    return format(date, 'h:mm a', { locale: es });
  } catch (error) {
    console.error('Error al formatear la hora:', error, timeString);
    return 'Error de formato';
  }
};

/**
 * Get a human-readable time ago string
 * @param date The date to format
 * @returns Human-readable time ago string
 */
export const timeAgo = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: es });
};

/**
 * Check if a routine is scheduled for today based on weekday schedule
 * @param weekdaySchedule Object containing weekday booleans
 * @returns Boolean indicating if routine is scheduled for today
 */
export const isScheduledForToday = (weekdaySchedule: Record<string, boolean>): boolean => {
  const today = getCurrentWeekday();
  return !!weekdaySchedule[today];
};

/**
 * Get the current weekday name (monday, tuesday, etc.)
 * @returns The current weekday name in lowercase
 */
export const getCurrentWeekday = (): string => {
  const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = new Date();
  return weekdays[today.getDay()];
};

/**
 * Check if a date is today
 * @param date Date to check
 * @returns Boolean indicating if date is today
 */
export const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isSameDay(dateObj, new Date());
};

/**
 * Format a duration in minutes to a readable format
 * @param minutes Duration in minutes
 * @returns Formatted duration string
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return hours === 1 ? '1 hora' : `${hours} horas`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};