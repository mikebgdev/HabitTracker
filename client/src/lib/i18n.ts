import { createContext, useContext } from 'react';

export type Language = 'en' | 'es';

export interface TranslationKeys {
  // Navigation
  'nav.dashboard': string;
  'nav.routines': string;
  'nav.groups': string;
  'nav.progress': string;
  'nav.account': string;
  'nav.logout': string;

  // Authentication
  'auth.login': string;
  'auth.loginWithGoogle': string;
  'auth.welcome': string;
  'auth.signOut': string;

  // Dashboard
  'dashboard.title': string;
  'dashboard.todayRoutines': string;
  'dashboard.noRoutinesScheduled': string;
  'dashboard.addRoutine': string;
  'dashboard.completeAllToday': string;
  'dashboard.markCompleted': string;
  'dashboard.markIncomplete': string;
  'dashboard.editRoutine': string;
  'dashboard.deleteRoutine': string;

  // Routines
  'routines.title': string;
  'routines.name': string;
  'routines.priority': string;
  'routines.expectedTime': string;
  'routines.high': string;
  'routines.medium': string;
  'routines.low': string;
  'routines.add': string;
  'routines.edit': string;
  'routines.delete': string;
  'routines.save': string;
  'routines.cancel': string;
  'routines.assignToGroup': string;

  // Groups
  'groups.title': string;
  'groups.name': string;
  'groups.icon': string;
  'groups.timeRange': string;
  'groups.add': string;
  'groups.edit': string;
  'groups.delete': string;
  'groups.noGroups': string;
  'groups.createFirst': string;

  // Progress
  'progress.title': string;
  'progress.analytics': string;
  'progress.overview': string;
  'progress.completionRate': string;
  'progress.dailyCompletion': string;
  'progress.completionByPriority': string;
  'progress.streakCalendar': string;
  'progress.week': string;
  'progress.month': string;
  'progress.year': string;
  'progress.completed': string;
  'progress.total': string;
  'progress.percentage': string;

  // Account
  'account.title': string;
  'account.language': string;
  'account.selectLanguage': string;
  'account.english': string;
  'account.spanish': string;
  'account.deleteAccount': string;
  'account.confirmDelete': string;
  'account.deleteWarning': string;
  'account.confirmDeleteButton': string;

  // Common
  'common.save': string;
  'common.cancel': string;
  'common.delete': string;
  'common.edit': string;
  'common.add': string;
  'common.close': string;
  'common.confirm': string;
  'common.yes': string;
  'common.no': string;
  'common.loading': string;
  'common.error': string;
  'common.success': string;

  // Time
  'time.minutes': string;
  'time.hours': string;
  'time.days': string;

  // Weekdays
  'weekdays.monday': string;
  'weekdays.tuesday': string;
  'weekdays.wednesday': string;
  'weekdays.thursday': string;
  'weekdays.friday': string;
  'weekdays.saturday': string;
  'weekdays.sunday': string;
}

const translations: Record<Language, TranslationKeys> = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.routines': 'Routines',
    'nav.groups': 'Groups',
    'nav.progress': 'Progress',
    'nav.account': 'Account',
    'nav.logout': 'Logout',

    // Authentication
    'auth.login': 'Login',
    'auth.loginWithGoogle': 'Sign in with Google',
    'auth.welcome': 'Welcome to HabitMaster',
    'auth.signOut': 'Sign Out',

    // Dashboard
    'dashboard.title': 'Daily Routines',
    'dashboard.todayRoutines': "Today's Routines",
    'dashboard.noRoutinesScheduled': 'No routines scheduled for today',
    'dashboard.addRoutine': 'Add Routine',
    'dashboard.completeAllToday': 'Complete all for today',
    'dashboard.markCompleted': 'Mark as completed',
    'dashboard.markIncomplete': 'Mark as incomplete',
    'dashboard.editRoutine': 'Edit routine',
    'dashboard.deleteRoutine': 'Delete routine',

    // Routines
    'routines.title': 'Routines',
    'routines.name': 'Name',
    'routines.priority': 'Priority',
    'routines.expectedTime': 'Expected Time',
    'routines.high': 'High',
    'routines.medium': 'Medium',
    'routines.low': 'Low',
    'routines.add': 'Add Routine',
    'routines.edit': 'Edit Routine',
    'routines.delete': 'Delete Routine',
    'routines.save': 'Save',
    'routines.cancel': 'Cancel',
    'routines.assignToGroup': 'Assign to Group',

    // Groups
    'groups.title': 'Groups',
    'groups.name': 'Name',
    'groups.icon': 'Icon',
    'groups.timeRange': 'Time Range',
    'groups.add': 'Add Group',
    'groups.edit': 'Edit Group',
    'groups.delete': 'Delete Group',
    'groups.noGroups': 'No groups created yet',
    'groups.createFirst': 'Create your first group',

    // Progress
    'progress.title': 'Progress & Analytics',
    'progress.analytics': 'Analytics',
    'progress.overview': 'Overview',
    'progress.completionRate': 'Completion Rate',
    'progress.dailyCompletion': 'Daily Completion Rate',
    'progress.completionByPriority': 'Completion by Priority',
    'progress.streakCalendar': 'Streak Calendar',
    'progress.week': 'Week',
    'progress.month': 'Month',
    'progress.year': 'Year',
    'progress.completed': 'Completed',
    'progress.total': 'Total',
    'progress.percentage': 'Percentage',

    // Account
    'account.title': 'Account Settings',
    'account.language': 'Language',
    'account.selectLanguage': 'Select Language',
    'account.english': 'English',
    'account.spanish': 'Spanish',
    'account.deleteAccount': 'Delete Account',
    'account.confirmDelete': 'Confirm Account Deletion',
    'account.deleteWarning': 'This action cannot be undone. All your data will be permanently deleted.',
    'account.confirmDeleteButton': 'Delete My Account',

    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.close': 'Close',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',

    // Time
    'time.minutes': 'minutes',
    'time.hours': 'hours',
    'time.days': 'days',

    // Weekdays
    'weekdays.monday': 'Monday',
    'weekdays.tuesday': 'Tuesday',
    'weekdays.wednesday': 'Wednesday',
    'weekdays.thursday': 'Thursday',
    'weekdays.friday': 'Friday',
    'weekdays.saturday': 'Saturday',
    'weekdays.sunday': 'Sunday',
  },
  es: {
    // Navigation
    'nav.dashboard': 'Panel',
    'nav.routines': 'Rutinas',
    'nav.groups': 'Grupos',
    'nav.progress': 'Progreso',
    'nav.account': 'Cuenta',
    'nav.logout': 'Cerrar Sesión',

    // Authentication
    'auth.login': 'Iniciar Sesión',
    'auth.loginWithGoogle': 'Iniciar sesión con Google',
    'auth.welcome': 'Bienvenido a HabitMaster',
    'auth.signOut': 'Cerrar Sesión',

    // Dashboard
    'dashboard.title': 'Rutinas Diarias',
    'dashboard.todayRoutines': 'Rutinas de Hoy',
    'dashboard.noRoutinesScheduled': 'No hay rutinas programadas para hoy',
    'dashboard.addRoutine': 'Agregar Rutina',
    'dashboard.completeAllToday': 'Completar todas para hoy',
    'dashboard.markCompleted': 'Marcar como completada',
    'dashboard.markIncomplete': 'Marcar como incompleta',
    'dashboard.editRoutine': 'Editar rutina',
    'dashboard.deleteRoutine': 'Eliminar rutina',

    // Routines
    'routines.title': 'Rutinas',
    'routines.name': 'Nombre',
    'routines.priority': 'Prioridad',
    'routines.expectedTime': 'Tiempo Esperado',
    'routines.high': 'Alta',
    'routines.medium': 'Media',
    'routines.low': 'Baja',
    'routines.add': 'Agregar Rutina',
    'routines.edit': 'Editar Rutina',
    'routines.delete': 'Eliminar Rutina',
    'routines.save': 'Guardar',
    'routines.cancel': 'Cancelar',
    'routines.assignToGroup': 'Asignar a Grupo',

    // Groups
    'groups.title': 'Grupos',
    'groups.name': 'Nombre',
    'groups.icon': 'Icono',
    'groups.timeRange': 'Rango de Tiempo',
    'groups.add': 'Agregar Grupo',
    'groups.edit': 'Editar Grupo',
    'groups.delete': 'Eliminar Grupo',
    'groups.noGroups': 'No hay grupos creados aún',
    'groups.createFirst': 'Crea tu primer grupo',

    // Progress
    'progress.title': 'Progreso y Análisis',
    'progress.analytics': 'Análisis',
    'progress.overview': 'Resumen',
    'progress.completionRate': 'Tasa de Finalización',
    'progress.dailyCompletion': 'Tasa de Finalización Diaria',
    'progress.completionByPriority': 'Finalización por Prioridad',
    'progress.streakCalendar': 'Calendario de Rachas',
    'progress.week': 'Semana',
    'progress.month': 'Mes',
    'progress.year': 'Año',
    'progress.completed': 'Completadas',
    'progress.total': 'Total',
    'progress.percentage': 'Porcentaje',

    // Account
    'account.title': 'Configuración de Cuenta',
    'account.language': 'Idioma',
    'account.selectLanguage': 'Seleccionar Idioma',
    'account.english': 'Inglés',
    'account.spanish': 'Español',
    'account.deleteAccount': 'Eliminar Cuenta',
    'account.confirmDelete': 'Confirmar Eliminación de Cuenta',
    'account.deleteWarning': 'Esta acción no se puede deshacer. Todos tus datos serán eliminados permanentemente.',
    'account.confirmDeleteButton': 'Eliminar Mi Cuenta',

    // Common
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.add': 'Agregar',
    'common.close': 'Cerrar',
    'common.confirm': 'Confirmar',
    'common.yes': 'Sí',
    'common.no': 'No',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',

    // Time
    'time.minutes': 'minutos',
    'time.hours': 'horas',
    'time.days': 'días',

    // Weekdays
    'weekdays.monday': 'Lunes',
    'weekdays.tuesday': 'Martes',
    'weekdays.wednesday': 'Miércoles',
    'weekdays.thursday': 'Jueves',
    'weekdays.friday': 'Viernes',
    'weekdays.saturday': 'Sábado',
    'weekdays.sunday': 'Domingo',
  },
};

export interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof TranslationKeys) => string;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

export const getTranslation = (language: Language, key: keyof TranslationKeys): string => {
  return translations[language][key] || key;
};