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
  type InsertCompletion,
  users, routines, groups, groupRoutines, weekdaySchedules,
  repetitionSchedules, completions
} from "@shared/schema";
import { eq, and, gte, lte, sql, desc, asc } from "drizzle-orm";
import { db } from "./db";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Routine methods
  getRoutineById(id: number): Promise<Routine | undefined>;
  getRoutinesByUserId(userId: number): Promise<Routine[]>;
  createRoutine(routine: InsertRoutine): Promise<Routine>;
  updateRoutine(id: number, routine: Partial<InsertRoutine>): Promise<Routine>;
  deleteRoutine(id: number): Promise<void>;
  getDailyRoutines(userId: number, date: string): Promise<(Routine & { completedAt?: string })[]>;
  getDailyRoutinesByGroup(userId: number, date: string): Promise<Group[]>;
  
  // Group methods
  getGroupById(id: number): Promise<Group | undefined>;
  getGroupsByUserId(userId: number): Promise<Group[]>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: number, group: Partial<InsertGroup>): Promise<Group>;
  deleteGroup(id: number): Promise<void>;
  
  // Group-Routine relationship methods
  addRoutineToGroup(routineId: number, groupId: number): Promise<GroupRoutine>;
  removeRoutineFromGroup(routineId: number, groupId: number): Promise<void>;
  getRoutinesByGroupId(groupId: number): Promise<Routine[]>;
  getRoutinesByGroupIdAndDate(groupId: number, date: string): Promise<(Routine & { completedAt?: string })[]>;
  
  // Weekday schedule methods
  createWeekdaySchedule(schedule: InsertWeekdaySchedule): Promise<WeekdaySchedule>;
  updateWeekdaySchedule(routineId: number, weekdays: Record<string, boolean>): Promise<WeekdaySchedule>;
  getWeekdayScheduleByRoutineId(routineId: number): Promise<WeekdaySchedule | undefined>;
  
  // Repetition schedule methods
  createRepetitionSchedule(schedule: InsertRepetitionSchedule): Promise<RepetitionSchedule>;
  updateRepetitionSchedule(id: number, schedule: Partial<InsertRepetitionSchedule>): Promise<RepetitionSchedule>;
  getRepetitionScheduleByRoutineId(routineId: number): Promise<RepetitionSchedule | undefined>;
  
  // Completion methods
  createCompletion(completion: InsertCompletion): Promise<Completion>;
  deleteCompletion(routineId: number, date: string): Promise<void>;
  getCompletionStats(userId: number, startDate: string, endDate: string): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private routines: Map<number, Routine>;
  private groups: Map<number, Group>;
  private groupRoutines: Map<number, GroupRoutine>;
  private weekdaySchedules: Map<number, WeekdaySchedule>;
  private repetitionSchedules: Map<number, RepetitionSchedule>;
  private completions: Map<number, Completion>;

  private userId: number;
  private routineId: number;
  private groupId: number;
  private groupRoutineId: number;
  private weekdayScheduleId: number;
  private repetitionScheduleId: number;
  private completionId: number;
  
  constructor() {
    this.users = new Map();
    this.routines = new Map();
    this.groups = new Map();
    this.groupRoutines = new Map();
    this.weekdaySchedules = new Map();
    this.repetitionSchedules = new Map();
    this.completions = new Map();
    
    this.userId = 1;
    this.routineId = 1;
    this.groupId = 1;
    this.groupRoutineId = 1;
    this.weekdayScheduleId = 1;
    this.repetitionScheduleId = 1;
    this.completionId = 1;
    
    // Create seed data synchronously
    this.seedData();
  }
  
  // Seed data method to add initial data
  private seedData() {
    // Create a demo user
    const user: User = {
      id: this.userId++,
      username: "demo",
      email: "demo@example.com",
      password: "$2b$10$demohashedpasswordexamplehash", // Pre-hashed password
      createdAt: new Date()
    };
    this.users.set(user.id, user);
    
    // Create groups
    const group1: Group = {
      id: this.groupId++,
      name: "Morning Routines",
      icon: "sun",
      timeRange: "6:00 AM - 8:00 AM",
      userId: user.id,
      createdAt: new Date()
    };
    this.groups.set(group1.id, group1);
    
    const group2: Group = {
      id: this.groupId++,
      name: "Work Routines",
      icon: "briefcase",
      timeRange: "9:00 AM - 5:00 PM",
      userId: user.id,
      createdAt: new Date()
    };
    this.groups.set(group2.id, group2);
    
    const group3: Group = {
      id: this.groupId++,
      name: "Evening Routines",
      icon: "moon",
      timeRange: "6:00 PM - 10:00 PM",
      userId: user.id,
      createdAt: new Date()
    };
    this.groups.set(group3.id, group3);
    
    // Create routines and add to groups
    const routinesData = [
      { name: "Morning Meditation", priority: "high", expectedTime: "10 min", group: group1, order: 1 },
      { name: "Breakfast", priority: "high", expectedTime: "20 min", group: group1, order: 2 },
      { name: "Daily Planning", priority: "medium", expectedTime: "15 min", group: group1, order: 3 },
      { name: "Morning Exercise", priority: "high", expectedTime: "30 min", group: group1, order: 4 },
      { name: "Check Emails", priority: "medium", expectedTime: "20 min", group: group1, order: 5 },
      { name: "Team Meeting", priority: "high", expectedTime: "60 min", group: group2, order: 1 },
      { name: "Project Work", priority: "high", expectedTime: "120 min", group: group2, order: 2 },
      { name: "Lunch Break", priority: "medium", expectedTime: "45 min", group: group2, order: 3 },
      { name: "Review Progress", priority: "medium", expectedTime: "30 min", group: group2, order: 4 },
      { name: "Dinner", priority: "high", expectedTime: "45 min", group: group3, order: 1 },
      { name: "Evening Workout", priority: "medium", expectedTime: "45 min", group: group3, order: 2 },
      { name: "Reading", priority: "low", expectedTime: "30 min", group: group3, order: 3 },
      { name: "Journal", priority: "medium", expectedTime: "15 min", group: group3, order: 4 }
    ];
    
    for (const data of routinesData) {
      const routine: Routine = {
        id: this.routineId++,
        name: data.name,
        priority: data.priority as "high" | "medium" | "low",
        expectedTime: data.expectedTime,
        userId: user.id,
        createdAt: new Date()
      };
      this.routines.set(routine.id, routine);
      
      // Add routine to group
      const groupRoutine: GroupRoutine = {
        id: this.groupRoutineId++,
        routineId: routine.id,
        groupId: data.group.id,
        order: data.order
      };
      this.groupRoutines.set(groupRoutine.id, groupRoutine);
      
      // Create weekday schedule
      const isWorkOrMorningRoutine = data.group.id === group1.id || data.group.id === group2.id;
      const weekdaySchedule: WeekdaySchedule = {
        id: this.weekdayScheduleId++,
        routineId: routine.id,
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: !isWorkOrMorningRoutine, // Weekend only for evening routines
        sunday: !isWorkOrMorningRoutine    // Weekend only for evening routines
      };
      this.weekdaySchedules.set(weekdaySchedule.id, weekdaySchedule);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of Array.from(this.users.values())) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: this.userId++,
      createdAt: new Date(),
      ...user
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async getRoutineById(id: number): Promise<Routine | undefined> {
    return this.routines.get(id);
  }

  async getRoutinesByUserId(userId: number): Promise<Routine[]> {
    return Array.from(this.routines.values()).filter(routine => routine.userId === userId);
  }

  async createRoutine(routine: InsertRoutine): Promise<Routine> {
    const newRoutine: Routine = {
      id: this.routineId++,
      createdAt: new Date(),
      ...routine
    };
    this.routines.set(newRoutine.id, newRoutine);
    return newRoutine;
  }

  async updateRoutine(id: number, routineData: Partial<InsertRoutine>): Promise<Routine> {
    const routine = await this.getRoutineById(id);
    if (!routine) {
      throw new Error(`Routine with ID ${id} not found`);
    }
    
    const updatedRoutine: Routine = {
      ...routine,
      ...routineData
    };
    this.routines.set(id, updatedRoutine);
    return updatedRoutine;
  }

  async deleteRoutine(id: number): Promise<void> {
    if (!this.routines.has(id)) {
      throw new Error(`Routine with ID ${id} not found`);
    }
    
    this.routines.delete(id);
    
    // Delete related entities
    // Delete from group-routine relationships
    for (const [grId, gr] of Array.from(this.groupRoutines.entries())) {
      if (gr.routineId === id) {
        this.groupRoutines.delete(grId);
      }
    }
    
    // Delete weekday schedule
    for (const [wsId, ws] of Array.from(this.weekdaySchedules.entries())) {
      if (ws.routineId === id) {
        this.weekdaySchedules.delete(wsId);
      }
    }
    
    // Delete repetition schedule
    for (const [rsId, rs] of Array.from(this.repetitionSchedules.entries())) {
      if (rs.routineId === id) {
        this.repetitionSchedules.delete(rsId);
      }
    }
    
    // Delete completions
    for (const [cId, completion] of Array.from(this.completions.entries())) {
      if (completion.routineId === id) {
        this.completions.delete(cId);
      }
    }
  }

  async getDailyRoutines(userId: number, date: string): Promise<(Routine & { completedAt?: string })[]> {
    // Get all routines for this user
    const userRoutines = await this.getRoutinesByUserId(userId);
    
    // Get day of week from date (0-6, where 0 is Sunday)
    const dayOfWeek = new Date(date).getDay();
    const weekdayName = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][dayOfWeek];
    
    // Get completions for the given date
    const completionsMap = new Map<number, string>();
    for (const completion of Array.from(this.completions.values())) {
      if (completion.userId === userId && completion.completedAt.toISOString().substring(0, 10) === date) {
        completionsMap.set(completion.routineId, completion.completedAt.toISOString());
      }
    }
    
    // Filter routines by weekday schedule
    const result: (Routine & { completedAt?: string })[] = [];
    
    for (const routine of userRoutines) {
      // Check weekday schedule
      const weekdaySchedule = await this.getWeekdayScheduleByRoutineId(routine.id);
      
      if (weekdaySchedule && weekdaySchedule[weekdayName as keyof typeof weekdaySchedule] === true) {
        result.push({
          ...routine,
          completedAt: completionsMap.get(routine.id)
        });
      }
    }
    
    return result;
  }
  
  async getDailyRoutinesByGroup(userId: number, date: string): Promise<Group[]> {
    // Get all groups for this user
    const userGroups = await this.getGroupsByUserId(userId);
    
    // For each group, get routines scheduled for today
    const result: Group[] = [];
    
    for (const group of userGroups) {
      const routines = await this.getRoutinesByGroupIdAndDate(group.id, date);
      if (routines.length > 0) {
        result.push(group);
      }
    }
    
    return result;
  }

  async getGroupById(id: number): Promise<Group | undefined> {
    return this.groups.get(id);
  }

  async getGroupsByUserId(userId: number): Promise<Group[]> {
    return Array.from(this.groups.values()).filter(group => group.userId === userId);
  }

  async createGroup(group: InsertGroup): Promise<Group> {
    const newGroup: Group = {
      id: this.groupId++,
      createdAt: new Date(),
      ...group,
      icon: group.icon || null,
      timeRange: group.timeRange || null
    };
    this.groups.set(newGroup.id, newGroup);
    return newGroup;
  }

  async updateGroup(id: number, groupData: Partial<InsertGroup>): Promise<Group> {
    const group = await this.getGroupById(id);
    if (!group) {
      throw new Error(`Group with ID ${id} not found`);
    }
    
    const updatedGroup: Group = {
      ...group,
      ...groupData,
      icon: groupData.icon !== undefined ? groupData.icon : group.icon,
      timeRange: groupData.timeRange !== undefined ? groupData.timeRange : group.timeRange
    };
    this.groups.set(id, updatedGroup);
    return updatedGroup;
  }

  async deleteGroup(id: number): Promise<void> {
    if (!this.groups.has(id)) {
      throw new Error(`Group with ID ${id} not found`);
    }
    
    this.groups.delete(id);
    
    // Remove group-routine relationships
    for (const [grId, gr] of Array.from(this.groupRoutines.entries())) {
      if (gr.groupId === id) {
        this.groupRoutines.delete(grId);
      }
    }
  }

  async addRoutineToGroup(routineId: number, groupId: number): Promise<GroupRoutine> {
    // Check if routine and group exist
    const routine = await this.getRoutineById(routineId);
    if (!routine) {
      throw new Error(`Routine with ID ${routineId} not found`);
    }
    
    const group = await this.getGroupById(groupId);
    if (!group) {
      throw new Error(`Group with ID ${groupId} not found`);
    }
    
    // Check if relationship already exists
    for (const gr of Array.from(this.groupRoutines.values())) {
      if (gr.routineId === routineId && gr.groupId === groupId) {
        return gr;
      }
    }
    
    // Get the current highest order in this group
    let maxOrder = 0;
    for (const gr of Array.from(this.groupRoutines.values())) {
      if (gr.groupId === groupId && gr.order > maxOrder) {
        maxOrder = gr.order;
      }
    }
    
    const newGroupRoutine: GroupRoutine = {
      id: this.groupRoutineId++,
      routineId,
      groupId,
      order: maxOrder + 1
    };
    this.groupRoutines.set(newGroupRoutine.id, newGroupRoutine);
    return newGroupRoutine;
  }

  async removeRoutineFromGroup(routineId: number, groupId: number): Promise<void> {
    for (const [id, gr] of Array.from(this.groupRoutines.entries())) {
      if (gr.routineId === routineId && gr.groupId === groupId) {
        this.groupRoutines.delete(id);
        return;
      }
    }
    throw new Error(`Routine ${routineId} is not in group ${groupId}`);
  }

  async getRoutinesByGroupId(groupId: number): Promise<Routine[]> {
    const routineIds = new Set<number>();
    
    // Get all routine IDs in this group
    for (const gr of Array.from(this.groupRoutines.values())) {
      if (gr.groupId === groupId) {
        routineIds.add(gr.routineId);
      }
    }
    
    // Get the actual routines
    const result: Routine[] = [];
    for (const id of Array.from(routineIds)) {
      const routine = await this.getRoutineById(id);
      if (routine) {
        result.push(routine);
      }
    }
    
    return result;
  }

  async getRoutinesByGroupIdAndDate(groupId: number, date: string): Promise<(Routine & { completedAt?: string })[]> {
    // Get all routines in this group
    const groupRoutines = await this.getRoutinesByGroupId(groupId);
    
    // Get day of week from date (0-6, where 0 is Sunday)
    const dayOfWeek = new Date(date).getDay();
    const weekdayName = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][dayOfWeek];
    
    // Get completions for the given date
    const completionsMap = new Map<number, string>();
    for (const completion of Array.from(this.completions.values())) {
      if (completion.completedAt.toISOString().substring(0, 10) === date) {
        completionsMap.set(completion.routineId, completion.completedAt.toISOString());
      }
    }
    
    // Filter routines by weekday schedule
    const result: (Routine & { completedAt?: string })[] = [];
    
    for (const routine of groupRoutines) {
      // Check weekday schedule
      const weekdaySchedule = await this.getWeekdayScheduleByRoutineId(routine.id);
      
      if (weekdaySchedule && weekdaySchedule[weekdayName as keyof typeof weekdaySchedule] === true) {
        result.push({
          ...routine,
          completedAt: completionsMap.get(routine.id)
        });
      }
    }
    
    return result;
  }

  async createWeekdaySchedule(schedule: InsertWeekdaySchedule): Promise<WeekdaySchedule> {
    const newSchedule: WeekdaySchedule = {
      id: this.weekdayScheduleId++,
      routineId: schedule.routineId,
      monday: schedule.monday ?? false,
      tuesday: schedule.tuesday ?? false,
      wednesday: schedule.wednesday ?? false,
      thursday: schedule.thursday ?? false,
      friday: schedule.friday ?? false,
      saturday: schedule.saturday ?? false,
      sunday: schedule.sunday ?? false
    };
    this.weekdaySchedules.set(newSchedule.id, newSchedule);
    return newSchedule;
  }

  async updateWeekdaySchedule(routineId: number, weekdays: Record<string, boolean>): Promise<WeekdaySchedule> {
    let schedule = await this.getWeekdayScheduleByRoutineId(routineId);
    
    if (!schedule) {
      throw new Error(`Weekday schedule for routine ${routineId} not found`);
    }
    
    const updatedSchedule: WeekdaySchedule = {
      ...schedule,
      ...weekdays
    };
    this.weekdaySchedules.set(schedule.id, updatedSchedule);
    return updatedSchedule;
  }

  async getWeekdayScheduleByRoutineId(routineId: number): Promise<WeekdaySchedule | undefined> {
    for (const schedule of Array.from(this.weekdaySchedules.values())) {
      if (schedule.routineId === routineId) {
        return schedule;
      }
    }
    return undefined;
  }

  async createRepetitionSchedule(schedule: InsertRepetitionSchedule): Promise<RepetitionSchedule> {
    const newSchedule: RepetitionSchedule = {
      id: this.repetitionScheduleId++,
      ...schedule
    };
    this.repetitionSchedules.set(newSchedule.id, newSchedule);
    return newSchedule;
  }

  async updateRepetitionSchedule(id: number, scheduleData: Partial<InsertRepetitionSchedule>): Promise<RepetitionSchedule> {
    const schedule = Array.from(this.repetitionSchedules.values()).find(s => s.id === id);
    
    if (!schedule) {
      throw new Error(`Repetition schedule with ID ${id} not found`);
    }
    
    const updatedSchedule: RepetitionSchedule = {
      ...schedule,
      ...scheduleData
    };
    this.repetitionSchedules.set(id, updatedSchedule);
    return updatedSchedule;
  }

  async getRepetitionScheduleByRoutineId(routineId: number): Promise<RepetitionSchedule | undefined> {
    for (const schedule of Array.from(this.repetitionSchedules.values())) {
      if (schedule.routineId === routineId) {
        return schedule;
      }
    }
    return undefined;
  }

  async createCompletion(completion: InsertCompletion): Promise<Completion> {
    const newCompletion: Completion = {
      id: this.completionId++,
      userId: completion.userId,
      routineId: completion.routineId,
      completedAt: completion.completedAt ? new Date(completion.completedAt) : new Date()
    };
    this.completions.set(newCompletion.id, newCompletion);
    return newCompletion;
  }

  async deleteCompletion(routineId: number, date: string): Promise<void> {
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    for (const [id, completion] of Array.from(this.completions.entries())) {
      if (completion.routineId === routineId &&
          completion.completedAt >= startOfDay &&
          completion.completedAt <= endOfDay) {
        this.completions.delete(id);
        return;
      }
    }
    throw new Error(`No completion found for routine ${routineId} on ${date}`);
  }

  async getCompletionStats(userId: number, startDate: string, endDate: string): Promise<any> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    // Get all routines for this user
    const routines = await this.getRoutinesByUserId(userId);
    
    // Collect completion data
    const completions = Array.from(this.completions.values()).filter(
      c => c.userId === userId && c.completedAt >= start && c.completedAt <= end
    );
    
    // Group completions by date
    const dateMap: Record<string, { total: number; completed: number }> = {};
    const priorityMap: Record<string, { total: number; completed: number }> = {
      high: { total: 0, completed: 0 },
      medium: { total: 0, completed: 0 },
      low: { total: 0, completed: 0 }
    };
    
    // Generate all dates in range
    const dates: string[] = [];
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().substring(0, 10);
      dates.push(dateStr);
      dateMap[dateStr] = { total: 0, completed: 0 };
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Process each date
    for (const dateStr of dates) {
      const dayOfWeek = new Date(dateStr).getDay();
      const weekdayName = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][dayOfWeek];
      
      // Count scheduled routines for this date
      for (const routine of routines) {
        const weekdaySchedule = await this.getWeekdayScheduleByRoutineId(routine.id);
        
        if (weekdaySchedule && weekdaySchedule[weekdayName as keyof typeof weekdaySchedule] === true) {
          dateMap[dateStr].total++;
          
          // Also count by priority
          priorityMap[routine.priority].total++;
          
          // Check if completed
          const isCompleted = completions.some(
            c => c.routineId === routine.id && 
                 c.completedAt.toISOString().substring(0, 10) === dateStr
          );
          
          if (isCompleted) {
            dateMap[dateStr].completed++;
            priorityMap[routine.priority].completed++;
          }
        }
      }
    }
    
    return {
      byDate: Object.entries(dateMap).map(([date, data]) => ({
        date,
        total: data.total,
        completed: data.completed,
        percentage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
      })),
      byPriority: Object.entries(priorityMap).map(([priority, data]) => ({
        priority,
        total: data.total,
        completed: data.completed,
        percentage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
      })),
      overall: {
        total: Object.values(dateMap).reduce((sum, data) => sum + data.total, 0),
        completed: Object.values(dateMap).reduce((sum, data) => sum + data.completed, 0)
      }
    };
  }
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  // Routine methods
  async getRoutineById(id: number): Promise<Routine | undefined> {
    const [routine] = await db.select().from(routines).where(eq(routines.id, id));
    return routine;
  }

  async getRoutinesByUserId(userId: number): Promise<Routine[]> {
    return await db.select().from(routines).where(eq(routines.userId, userId));
  }

  async createRoutine(routine: InsertRoutine): Promise<Routine> {
    const [newRoutine] = await db.insert(routines).values(routine).returning();
    return newRoutine;
  }

  async updateRoutine(id: number, routineData: Partial<InsertRoutine>): Promise<Routine> {
    const [updatedRoutine] = await db
      .update(routines)
      .set(routineData)
      .where(eq(routines.id, id))
      .returning();
    
    if (!updatedRoutine) {
      throw new Error(`Routine with id ${id} not found`);
    }
    
    return updatedRoutine;
  }

  async deleteRoutine(id: number): Promise<void> {
    // Delete related records first (cascade)
    await db.delete(groupRoutines).where(eq(groupRoutines.routineId, id));
    await db.delete(weekdaySchedules).where(eq(weekdaySchedules.routineId, id));
    await db.delete(repetitionSchedules).where(eq(repetitionSchedules.routineId, id));
    await db.delete(completions).where(eq(completions.routineId, id));
    
    // Then delete the routine
    await db.delete(routines).where(eq(routines.id, id));
  }

  async getDailyRoutines(userId: number, date: string): Promise<(Routine & { completedAt?: string })[]> {
    const weekday = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' });
    const weekdayField = weekdaySchedules[weekday as keyof typeof weekdaySchedules];
    
    // Get routines for user with their weekday schedules where this day is enabled
    const routinesForDay = await db
      .select({
        id: routines.id,
        name: routines.name,
        description: routines.description,
        priority: routines.priority,
        userId: routines.userId,
        expectedTime: routines.expectedTime,
        createdAt: routines.createdAt
      })
      .from(routines)
      .innerJoin(weekdaySchedules, eq(routines.id, weekdaySchedules.routineId))
      .where(and(
        eq(routines.userId, userId),
        eq(weekdayField, true)
      ));
    
    // Get completions for these routines on this date
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);
    
    const routineIds = routinesForDay.map(r => r.id);
    
    const completionsForDay = await db
      .select()
      .from(completions)
      .where(and(
        gte(completions.completedAt, dateStart.toISOString()),
        lte(completions.completedAt, dateEnd.toISOString()),
        sql`${completions.routineId} IN ${routineIds}`
      ));
    
    // Map completions to routines
    const completionsByRoutineId = new Map(
      completionsForDay.map(c => [c.routineId, c.completedAt])
    );
    
    return routinesForDay.map(routine => ({
      ...routine,
      completedAt: completionsByRoutineId.get(routine.id)
    }));
  }

  async getDailyRoutinesByGroup(userId: number, date: string): Promise<Group[]> {
    const userGroups = await this.getGroupsByUserId(userId);
    const routinesWithCompletion = await this.getDailyRoutines(userId, date);
    
    const result: Group[] = [];
    
    for (const group of userGroups) {
      const routineIdsInGroup = await db
        .select({ routineId: groupRoutines.routineId })
        .from(groupRoutines)
        .where(eq(groupRoutines.groupId, group.id));
      
      const routineIds = routineIdsInGroup.map(r => r.routineId);
      
      const groupRoutines = routinesWithCompletion
        .filter(routine => routineIds.includes(routine.id));
      
      if (groupRoutines.length > 0) {
        result.push({
          ...group,
          routines: groupRoutines
        } as any); // Type cast as any due to extended Group with routines
      }
    }
    
    return result;
  }

  // Group methods
  async getGroupById(id: number): Promise<Group | undefined> {
    const [group] = await db.select().from(groups).where(eq(groups.id, id));
    return group;
  }

  async getGroupsByUserId(userId: number): Promise<Group[]> {
    return await db.select().from(groups).where(eq(groups.userId, userId));
  }

  async createGroup(group: InsertGroup): Promise<Group> {
    const [newGroup] = await db.insert(groups).values(group).returning();
    return newGroup;
  }

  async updateGroup(id: number, groupData: Partial<InsertGroup>): Promise<Group> {
    const [updatedGroup] = await db
      .update(groups)
      .set(groupData)
      .where(eq(groups.id, id))
      .returning();
    
    if (!updatedGroup) {
      throw new Error(`Group with id ${id} not found`);
    }
    
    return updatedGroup;
  }

  async deleteGroup(id: number): Promise<void> {
    // Delete group-routine relationships first
    await db.delete(groupRoutines).where(eq(groupRoutines.groupId, id));
    
    // Then delete the group
    await db.delete(groups).where(eq(groups.id, id));
  }

  // Group-Routine relationship methods
  async addRoutineToGroup(routineId: number, groupId: number): Promise<GroupRoutine> {
    // Check if relationship already exists
    const [existing] = await db
      .select()
      .from(groupRoutines)
      .where(and(
        eq(groupRoutines.routineId, routineId),
        eq(groupRoutines.groupId, groupId)
      ));
    
    if (existing) {
      return existing;
    }
    
    // Get the current highest order in this group
    const [maxOrderResult] = await db
      .select({ maxOrder: sql`max(${groupRoutines.order})` })
      .from(groupRoutines)
      .where(eq(groupRoutines.groupId, groupId));

    const maxOrder = maxOrderResult?.maxOrder || 0;
    
    const [newGroupRoutine] = await db
      .insert(groupRoutines)
      .values({
        routineId,
        groupId,
        order: maxOrder + 1
      })
      .returning();
    
    return newGroupRoutine;
  }

  async removeRoutineFromGroup(routineId: number, groupId: number): Promise<void> {
    await db
      .delete(groupRoutines)
      .where(and(
        eq(groupRoutines.routineId, routineId),
        eq(groupRoutines.groupId, groupId)
      ));
  }

  async getRoutinesByGroupId(groupId: number): Promise<Routine[]> {
    const routinesInGroup = await db
      .select({
        routine: routines
      })
      .from(routines)
      .innerJoin(
        groupRoutines, 
        eq(routines.id, groupRoutines.routineId)
      )
      .where(eq(groupRoutines.groupId, groupId))
      .orderBy(groupRoutines.order);
    
    return routinesInGroup.map(r => r.routine);
  }

  async getRoutinesByGroupIdAndDate(groupId: number, date: string): Promise<(Routine & { completedAt?: string })[]> {
    const weekday = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' });
    const weekdayField = weekdaySchedules[weekday as keyof typeof weekdaySchedules];
    
    // Get routines for this group with their weekday schedules where this day is enabled
    const routinesForDay = await db
      .select({
        id: routines.id,
        name: routines.name,
        description: routines.description,
        priority: routines.priority,
        userId: routines.userId,
        expectedTime: routines.expectedTime,
        createdAt: routines.createdAt
      })
      .from(routines)
      .innerJoin(groupRoutines, eq(routines.id, groupRoutines.routineId))
      .innerJoin(weekdaySchedules, eq(routines.id, weekdaySchedules.routineId))
      .where(and(
        eq(groupRoutines.groupId, groupId),
        eq(weekdayField, true)
      ))
      .orderBy(groupRoutines.order);
    
    // Get completions for these routines on this date
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);
    
    const routineIds = routinesForDay.map(r => r.id);
    
    const completionsForDay = await db
      .select()
      .from(completions)
      .where(and(
        gte(completions.completedAt, dateStart.toISOString()),
        lte(completions.completedAt, dateEnd.toISOString()),
        sql`${completions.routineId} IN ${routineIds}`
      ));
    
    // Map completions to routines
    const completionsByRoutineId = new Map(
      completionsForDay.map(c => [c.routineId, c.completedAt])
    );
    
    return routinesForDay.map(routine => ({
      ...routine,
      completedAt: completionsByRoutineId.get(routine.id)
    }));
  }

  // Weekday schedule methods
  async createWeekdaySchedule(schedule: InsertWeekdaySchedule): Promise<WeekdaySchedule> {
    const [newSchedule] = await db
      .insert(weekdaySchedules)
      .values(schedule)
      .returning();
    
    return newSchedule;
  }

  async updateWeekdaySchedule(routineId: number, weekdaysData: Record<string, boolean>): Promise<WeekdaySchedule> {
    const [updatedSchedule] = await db
      .update(weekdaySchedules)
      .set(weekdaysData)
      .where(eq(weekdaySchedules.routineId, routineId))
      .returning();
    
    if (!updatedSchedule) {
      throw new Error(`Weekday schedule for routine ${routineId} not found`);
    }
    
    return updatedSchedule;
  }

  async getWeekdayScheduleByRoutineId(routineId: number): Promise<WeekdaySchedule | undefined> {
    const [schedule] = await db
      .select()
      .from(weekdaySchedules)
      .where(eq(weekdaySchedules.routineId, routineId));
    
    return schedule;
  }

  // Repetition schedule methods
  async createRepetitionSchedule(schedule: InsertRepetitionSchedule): Promise<RepetitionSchedule> {
    const [newSchedule] = await db
      .insert(repetitionSchedules)
      .values(schedule)
      .returning();
    
    return newSchedule;
  }

  async updateRepetitionSchedule(id: number, scheduleData: Partial<InsertRepetitionSchedule>): Promise<RepetitionSchedule> {
    const [updatedSchedule] = await db
      .update(repetitionSchedules)
      .set(scheduleData)
      .where(eq(repetitionSchedules.id, id))
      .returning();
    
    if (!updatedSchedule) {
      throw new Error(`Repetition schedule with id ${id} not found`);
    }
    
    return updatedSchedule;
  }

  async getRepetitionScheduleByRoutineId(routineId: number): Promise<RepetitionSchedule | undefined> {
    const [schedule] = await db
      .select()
      .from(repetitionSchedules)
      .where(eq(repetitionSchedules.routineId, routineId));
    
    return schedule;
  }

  // Completion methods
  async createCompletion(completion: InsertCompletion): Promise<Completion> {
    const [newCompletion] = await db
      .insert(completions)
      .values(completion)
      .returning();
    
    return newCompletion;
  }

  async deleteCompletion(routineId: number, date: string): Promise<void> {
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);
    
    await db
      .delete(completions)
      .where(and(
        eq(completions.routineId, routineId),
        gte(completions.completedAt, dateStart.toISOString()),
        lte(completions.completedAt, dateEnd.toISOString())
      ));
  }

  async getCompletionStats(userId: number, startDate: string, endDate: string): Promise<any> {
    // Get user's routines
    const userRoutines = await this.getRoutinesByUserId(userId);
    const routineIds = userRoutines.map(r => r.id);
    
    // Get completions for the date range
    const startDateObj = new Date(startDate);
    startDateObj.setHours(0, 0, 0, 0);
    
    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999);
    
    const completionsInRange = await db
      .select()
      .from(completions)
      .where(and(
        gte(completions.completedAt, startDateObj.toISOString()),
        lte(completions.completedAt, endDateObj.toISOString()),
        sql`${completions.routineId} IN ${routineIds}`
      ));
    
    // Group by date
    const completionsByDate: Record<string, number> = {};
    
    completionsInRange.forEach(completion => {
      const date = completion.completedAt.split('T')[0];
      completionsByDate[date] = (completionsByDate[date] || 0) + 1;
    });
    
    // Group by routine
    const completionsByRoutine: Record<number, number> = {};
    
    completionsInRange.forEach(completion => {
      completionsByRoutine[completion.routineId] = 
        (completionsByRoutine[completion.routineId] || 0) + 1;
    });
    
    // Calculate streaks
    const dates = Object.keys(completionsByDate).sort();
    let currentStreak = 0;
    let longestStreak = 0;
    
    for (let i = 0; i < dates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const current = new Date(dates[i]);
        const previous = new Date(dates[i - 1]);
        
        const diffDays = Math.floor(
          (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      }
      
      longestStreak = Math.max(longestStreak, currentStreak);
    }
    
    return {
      totalCompletions: completionsInRange.length,
      completionsByDate,
      completionsByRoutine,
      currentStreak,
      longestStreak
    };
  }
}

export const storage = new DatabaseStorage();