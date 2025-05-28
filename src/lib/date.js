import { format, formatDistanceToNow, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
export const formatDate = (date, formatStr) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, formatStr || 'PP', { locale: es });
};
export const formatTime = (timeString) => {
    if (!timeString) {
        return 'Hora no disponible';
    }
    try {
        if (timeString.includes('T')) {
            const date = new Date(timeString);
            if (isNaN(date.getTime())) {
                return 'Formato inválido';
            }
            return format(date, 'h:mm a', { locale: es });
        }
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
    }
    catch (error) {
        console.error('Error al formatear la hora:', error, timeString);
        return 'Error de formato';
    }
};
export const timeAgo = (date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: es });
};
export const isScheduledForToday = (weekdaySchedule) => {
    const today = getCurrentWeekday();
    return !!weekdaySchedule[today];
};
export const getCurrentWeekday = () => {
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date();
    return weekdays[today.getDay()];
};
export const isToday = (date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return isSameDay(dateObj, new Date());
};
export const formatDuration = (minutes) => {
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
