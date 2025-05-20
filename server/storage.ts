import { 
  users, 
  routines, 
  groups, 
  groupRoutines, 
  weekdaySchedules, 
  repetitionSchedules, 
  completions,
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
    
    // Seed some data for demo purposes
    this.seedData();
  }
  
  private seedData() {
    // Create demo user
    const demoUser: InsertUser = {
      username: "demo",
      email: "demo@example.com",
      password: "$2b$10$demohashedpasswordexamplehash" // Already hashed
    };
    
    const user = this.createUser(demoUser);
    
    // Create groups
    const morningGroup: InsertGroup = {
      name: "Morning Routines",
      icon: "fa-sun",
      timeRange: "6:00 AM - 8:00 AM",
      userId: 1
    };
    
    const workGroup: InsertGroup = {
      name: "Work Routines",
      icon: "fa-briefcase",
      timeRange: "9:00 AM - 5:00 PM",
      userId: 1
    };
    
    const eveningGroup: InsertGroup = {
      name: "Evening Routines",
      icon: "fa-moon",
      timeRange: "6:00 PM - 10:00 PM",
      userId: 1
    };
    
    this.createGroup(morningGroup).then(group1 => {
      this.createGroup(workGroup).then(group2 => {
        this.createGroup(eveningGroup).then(group3 => {
          // Create demo routines
          const routines = [
            {
              name: "Morning Meditation",
              priority: "high",
              expectedTime: "10 min",
              userId: 1
            },
            {
              name: "Breakfast",
              priority: "high",
              expectedTime: "20 min",
              userId: 1
            },
            {
              name: "Daily Planning",
              priority: "medium",
              expectedTime: "15 min",
              userId: 1
            },
            {
              name: "Morning Exercise",
              priority: "high",
              expectedTime: "30 min",
              userId: 1
            },
            {
              name: "Check Emails",
              priority: "medium",
              expectedTime: "20 min",
              userId: 1
            },
            {
              name: "Team Meeting",
              priority: "high",
              expectedTime: "60 min",
              userId: 1
            },
            {
              name: "Project Work",
              priority: "high",
              expectedTime: "120 min",
              userId: 1
            },
            {
              name: "Lunch Break",
              priority: "medium",
              expectedTime: "45 min",
              userId: 1
            },
            {
              name: "Review Progress",
              priority: "medium",
              expectedTime: "30 min",
              userId: 1
            },
            {
              name: "Dinner",
              priority: "high",
              expectedTime: "45 min",
              userId: 1
            },
            {
              name: "Evening Workout",
              priority: "medium",
              expectedTime: "45 min",
              userId: 1
            },
            {
              name: "Reading",
              priority: "low",
              expectedTime: "30 min",
              userId: 1
            },
            {
              name: "Journal",
              priority: "medium",
              expectedTime: "15 min",
              userId: 1
            }
          ] as InsertRoutine[];
          
          // Create routines one by one and add to groups
          Promise.all(routines.map(r => this.createRoutine(r)))
            .then(createdRoutines => {
              // Add routines to groups
              createdRoutines.forEach((routine, i) => {
                if (i < 5) {
                  this.addRoutineToGroup(routine.id, group1.id);
                  
                  // Create weekday schedule (Mon-Fri for morning routines)
                  this.createWeekdaySchedule({
                    routineId: routine.id,
                    monday: true,
                    tuesday: true,
                    wednesday: true,
                    thursday: true,
                    friday: true,
                    saturday: false,
                    sunday: false
                  });
                } else if (i < 9) {
                  this.addRoutineToGroup(routine.id, group2.id);
                  
                  // Create weekday schedule (Mon-Fri for work routines)
                  this.createWeekdaySchedule({
                    routineId: routine.id,
                    monday: true,
                    tuesday: true,
                    wednesday: true,
                    thursday: true,
                    friday: true,
                    saturday: false,
                    sunday: false
                  });
                } else {
                  this.addRoutineToGroup(routine.id, group3.id);
                  
                  // Create weekday schedule (Daily for evening routines)
                  this.createWeekdaySchedule({
                    routineId: routine.id,
                    monday: true,
                    tuesday: true,
                    wednesday: true,
                    thursday: true,
                    friday: true,
                    saturday: true,
                    sunday: true
                  });
                }
              });
            });
        });
      });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
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
    for (const [grId, gr] of this.groupRoutines.entries()) {
      if (gr.routineId === id) {
        this.groupRoutines.delete(grId);
      }
    }
    
    // Delete weekday schedule
    for (const [wsId, ws] of this.weekdaySchedules.entries()) {
      if (ws.routineId === id) {
        this.weekdaySchedules.delete(wsId);
      }
    }
    
    // Delete repetition schedule
    for (const [rsId, rs] of this.repetitionSchedules.entries()) {
      if (rs.routineId === id) {
        this.repetitionSchedules.delete(rsId);
      }
    }
    
    // Delete completions
    for (const [cId, completion] of this.completions.entries()) {
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
    for (const completion of this.completions.values()) {
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
      ...group
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
      ...groupData
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
    for (const [grId, gr] of this.groupRoutines.entries()) {
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
    for (const gr of this.groupRoutines.values()) {
      if (gr.routineId === routineId && gr.groupId === groupId) {
        return gr;
      }
    }
    
    const newGroupRoutine: GroupRoutine = {
      id: this.groupRoutineId++,
      routineId,
      groupId
    };
    this.groupRoutines.set(newGroupRoutine.id, newGroupRoutine);
    return newGroupRoutine;
  }

  async removeRoutineFromGroup(routineId: number, groupId: number): Promise<void> {
    for (const [id, gr] of this.groupRoutines.entries()) {
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
    for (const gr of this.groupRoutines.values()) {
      if (gr.groupId === groupId) {
        routineIds.add(gr.routineId);
      }
    }
    
    // Get the actual routines
    const result: Routine[] = [];
    for (const id of routineIds) {
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
    for (const completion of this.completions.values()) {
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
      ...schedule
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
    for (const schedule of this.weekdaySchedules.values()) {
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
    for (const schedule of this.repetitionSchedules.values()) {
      if (schedule.routineId === routineId) {
        return schedule;
      }
    }
    return undefined;
  }

  async createCompletion(completion: InsertCompletion): Promise<Completion> {
    const newCompletion: Completion = {
      id: this.completionId++,
      ...completion,
      completedAt: new Date(completion.completedAt || new Date())
    };
    this.completions.set(newCompletion.id, newCompletion);
    return newCompletion;
  }

  async deleteCompletion(routineId: number, date: string): Promise<void> {
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    for (const [id, completion] of this.completions.entries()) {
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

export const storage = new MemStorage();