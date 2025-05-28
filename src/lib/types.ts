export interface Routine {
  id: number;
  name: string;
  expectedTime: string;
  priority: 'high' | 'medium' | 'low';
  icon?: string;
  userId: string;
  archived: boolean;
  archivedAt?: string;
  createdAt?: string;
}

export interface InsertRoutine {
  name: string;
  expectedTime: string;
  priority: 'high' | 'medium' | 'low';
  icon?: string;
  userId: string;
  archived?: boolean;
  archivedAt?: string;
}

export interface Group {
  id: number;
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

export interface GroupRoutine {
  id: number;
  groupId: number;
  routineId: number;
  order: number;
}

export interface InsertGroupRoutine {
  groupId: number;
  routineId: number;
  order: number;
}

export interface WeekdaySchedule {
  id: number;
  routineId: number;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export interface InsertWeekdaySchedule {
  routineId: number;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export interface Completion {
  id: number;
  routineId: number;
  completedAt: string;
  userId: string;
}

export interface InsertCompletion {
  routineId: number;
  completedAt: string;
  userId: string;
}