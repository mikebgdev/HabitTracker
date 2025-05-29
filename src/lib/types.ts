export interface Routine {
  id: string;
  name: string;
  expectedTime: string;
  priority: 'high' | 'medium' | 'low';
  icon?: string;
  userId: string;
  groupId?: string;
  archived: boolean;
  archivedAt?: string;
  createdAt?: string;
  completed?: boolean;
}

export interface InsertRoutine {
  name: string;
  expectedTime: string;
  priority: 'high' | 'medium' | 'low';
  icon?: string;
  userId: string;
  groupId?: string;
  archived?: boolean;
  archivedAt?: string;
}

export interface Group {
  id: string;
  name: string;
  icon?: string;
  timeRange?: string;
  userId: string;
  createdAt?: string;
}

export interface InsertGroup {
  name: string;
  icon?: string;
  timeRange?: string;
  userId: string;
}

export interface WeekdaySchedule {
  id: string;
  routineId: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export interface InsertWeekdaySchedule {
  routineId: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export interface Completion {
  id: string;
  routineId: string;
  completedAt: string;
  userId: string;
}

export interface InsertCompletion {
  routineId: string;
  completedAt: string;
  userId: string;
}

export type DayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';
