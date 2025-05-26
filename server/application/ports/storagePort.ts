import {
  type User,
  type InsertUser,
  type Routine,
  type InsertRoutine,
  type Group,
  type InsertGroup,
  type GroupRoutine,
  type InsertGroupRoutine,
  type WeekdaySchedule,
  type InsertWeekdaySchedule,
  type RepetitionSchedule,
  type InsertRepetitionSchedule,
  type Completion,
  type InsertCompletion
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getRoutineById(id: number): Promise<Routine | undefined>;
  getRoutinesByUserId(userId: number): Promise<Routine[]>;
  createRoutine(routine: InsertRoutine): Promise<Routine>;
  updateRoutine(id: number, routine: Partial<InsertRoutine>): Promise<Routine>;
  deleteRoutine(id: number): Promise<void>;
  getDailyRoutines(userId: number, date: string): Promise<(Routine & { completedAt?: string })[]>;
  getDailyRoutinesByGroup(userId: number, date: string): Promise<Group[]>;

  getGroupById(id: number): Promise<Group | undefined>;
  getGroupsByUserId(userId: number): Promise<Group[]>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: number, group: Partial<InsertGroup>): Promise<Group>;
  deleteGroup(id: number): Promise<void>;

  addRoutineToGroup(routineId: number, groupId: number): Promise<GroupRoutine>;
  removeRoutineFromGroup(routineId: number, groupId: number): Promise<void>;
  getRoutinesByGroupId(groupId: number): Promise<Routine[]>;
  getRoutinesByGroupIdAndDate(groupId: number, date: string): Promise<(Routine & { completedAt?: string })[]>;
  getAllGroupRoutines(): Promise<GroupRoutine[]>;

  createWeekdaySchedule(schedule: InsertWeekdaySchedule): Promise<WeekdaySchedule>;
  updateWeekdaySchedule(routineId: number, weekdays: Record<string, boolean>): Promise<WeekdaySchedule>;
  getWeekdayScheduleByRoutineId(routineId: number): Promise<WeekdaySchedule | undefined>;

  createRepetitionSchedule(schedule: InsertRepetitionSchedule): Promise<RepetitionSchedule>;
  updateRepetitionSchedule(id: number, schedule: Partial<InsertRepetitionSchedule>): Promise<RepetitionSchedule>;
  getRepetitionScheduleByRoutineId(routineId: number): Promise<RepetitionSchedule | undefined>;

  createCompletion(completion: InsertCompletion): Promise<Completion>;
  deleteCompletion(routineId: number, date: string): Promise<void>;
  getCompletionStats(userId: number, startDate: string, endDate: string): Promise<any>;
}