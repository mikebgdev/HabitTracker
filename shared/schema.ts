import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    email: z.string().email("Invalid email address"),
  });

export const loginUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Priority enum
export const priorityEnum = pgEnum("priority", ["high", "medium", "low"]);

// Routines table
export const routines = pgTable("routines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  expectedTime: text("expected_time").notNull(), // HH:MM format
  priority: priorityEnum("priority").notNull(),
  icon: text("icon"),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRoutineSchema = createInsertSchema(routines).omit({
  id: true,
  createdAt: true,
});

// Groups table
export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon"), // Font Awesome icon class
  timeRange: text("time_range"), // e.g. "6:00 AM - 8:00 AM"
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  createdAt: true,
});

// Group-Routine relationship table
export const groupRoutines = pgTable("group_routines", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  routineId: integer("routine_id")
    .notNull()
    .references(() => routines.id, { onDelete: "cascade" }),
  order: integer("order").notNull(), // For ordering routines within a group
});

export const insertGroupRoutineSchema = createInsertSchema(groupRoutines).omit({
  id: true,
});

// Scheduling by days of the week
export const weekdaySchedules = pgTable("weekday_schedules", {
  id: serial("id").primaryKey(),
  routineId: integer("routine_id")
    .notNull()
    .references(() => routines.id, { onDelete: "cascade" }),
  monday: boolean("monday").default(false).notNull(),
  tuesday: boolean("tuesday").default(false).notNull(),
  wednesday: boolean("wednesday").default(false).notNull(),
  thursday: boolean("thursday").default(false).notNull(),
  friday: boolean("friday").default(false).notNull(),
  saturday: boolean("saturday").default(false).notNull(),
  sunday: boolean("sunday").default(false).notNull(),
});

export const insertWeekdayScheduleSchema = createInsertSchema(weekdaySchedules).omit({
  id: true,
});

// Scheduling by repetition pattern
export const repetitionSchedules = pgTable("repetition_schedules", {
  id: serial("id").primaryKey(),
  routineId: integer("routine_id")
    .notNull()
    .references(() => routines.id, { onDelete: "cascade" }),
  pattern: text("pattern").notNull(), // e.g. "every_2_days", "1_day_on_1_off"
  startDate: timestamp("start_date").notNull(), // When this pattern starts
});

export const insertRepetitionScheduleSchema = createInsertSchema(repetitionSchedules).omit({
  id: true,
});

// Completion records
export const completions = pgTable("completions", {
  id: serial("id").primaryKey(),
  routineId: integer("routine_id")
    .notNull()
    .references(() => routines.id, { onDelete: "cascade" }),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const insertCompletionSchema = createInsertSchema(completions).omit({
  id: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;

export type Routine = typeof routines.$inferSelect;
export type InsertRoutine = z.infer<typeof insertRoutineSchema>;

export type Group = typeof groups.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;

export type GroupRoutine = typeof groupRoutines.$inferSelect;
export type InsertGroupRoutine = z.infer<typeof insertGroupRoutineSchema>;

export type WeekdaySchedule = typeof weekdaySchedules.$inferSelect;
export type InsertWeekdaySchedule = z.infer<typeof insertWeekdayScheduleSchema>;

export type RepetitionSchedule = typeof repetitionSchedules.$inferSelect;
export type InsertRepetitionSchedule = z.infer<typeof insertRepetitionScheduleSchema>;

export type Completion = typeof completions.$inferSelect;
export type InsertCompletion = z.infer<typeof insertCompletionSchema>;
