"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertCompletionSchema = exports.completions = exports.insertRepetitionScheduleSchema = exports.repetitionSchedules = exports.insertWeekdayScheduleSchema = exports.weekdaySchedules = exports.insertGroupRoutineSchema = exports.groupRoutines = exports.insertGroupSchema = exports.groups = exports.insertRoutineSchema = exports.routines = exports.priorityEnum = exports.loginUserSchema = exports.insertUserSchema = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    username: (0, pg_core_1.text)("username").notNull().unique(),
    password: (0, pg_core_1.text)("password").notNull(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users)
    .omit({
    id: true,
    createdAt: true,
})
    .extend({
    username: zod_1.z.string().min(3, "Username must be at least 3 characters"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    email: zod_1.z.string().email("Invalid email address"),
});
exports.loginUserSchema = zod_1.z.object({
    username: zod_1.z.string().min(3, "Username must be at least 3 characters"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
exports.priorityEnum = (0, pg_core_1.pgEnum)("priority", ["high", "medium", "low"]);
exports.routines = (0, pg_core_1.pgTable)("routines", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    expectedTime: (0, pg_core_1.text)("expected_time").notNull(),
    priority: (0, exports.priorityEnum)("priority").notNull(),
    icon: (0, pg_core_1.text)("icon"),
    userId: (0, pg_core_1.integer)("user_id")
        .notNull()
        .references(() => exports.users.id, { onDelete: "cascade" }),
    archived: (0, pg_core_1.boolean)("archived").default(false).notNull(),
    archivedAt: (0, pg_core_1.timestamp)("archived_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.insertRoutineSchema = (0, drizzle_zod_1.createInsertSchema)(exports.routines).omit({
    id: true,
    createdAt: true,
});
exports.groups = (0, pg_core_1.pgTable)("groups", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    icon: (0, pg_core_1.text)("icon"),
    timeRange: (0, pg_core_1.text)("time_range"),
    userId: (0, pg_core_1.integer)("user_id")
        .notNull()
        .references(() => exports.users.id, { onDelete: "cascade" }),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.insertGroupSchema = (0, drizzle_zod_1.createInsertSchema)(exports.groups).omit({
    id: true,
    createdAt: true,
});
exports.groupRoutines = (0, pg_core_1.pgTable)("group_routines", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    groupId: (0, pg_core_1.integer)("group_id")
        .notNull()
        .references(() => exports.groups.id, { onDelete: "cascade" }),
    routineId: (0, pg_core_1.integer)("routine_id")
        .notNull()
        .references(() => exports.routines.id, { onDelete: "cascade" }),
    order: (0, pg_core_1.integer)("order").notNull(),
});
exports.insertGroupRoutineSchema = (0, drizzle_zod_1.createInsertSchema)(exports.groupRoutines).omit({
    id: true,
});
exports.weekdaySchedules = (0, pg_core_1.pgTable)("weekday_schedules", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    routineId: (0, pg_core_1.integer)("routine_id")
        .notNull()
        .references(() => exports.routines.id, { onDelete: "cascade" }),
    monday: (0, pg_core_1.boolean)("monday").default(false).notNull(),
    tuesday: (0, pg_core_1.boolean)("tuesday").default(false).notNull(),
    wednesday: (0, pg_core_1.boolean)("wednesday").default(false).notNull(),
    thursday: (0, pg_core_1.boolean)("thursday").default(false).notNull(),
    friday: (0, pg_core_1.boolean)("friday").default(false).notNull(),
    saturday: (0, pg_core_1.boolean)("saturday").default(false).notNull(),
    sunday: (0, pg_core_1.boolean)("sunday").default(false).notNull(),
});
exports.insertWeekdayScheduleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.weekdaySchedules).omit({
    id: true,
});
exports.repetitionSchedules = (0, pg_core_1.pgTable)("repetition_schedules", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    routineId: (0, pg_core_1.integer)("routine_id")
        .notNull()
        .references(() => exports.routines.id, { onDelete: "cascade" }),
    pattern: (0, pg_core_1.text)("pattern").notNull(),
    startDate: (0, pg_core_1.timestamp)("start_date").notNull(),
});
exports.insertRepetitionScheduleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.repetitionSchedules).omit({
    id: true,
});
exports.completions = (0, pg_core_1.pgTable)("completions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    routineId: (0, pg_core_1.integer)("routine_id")
        .notNull()
        .references(() => exports.routines.id, { onDelete: "cascade" }),
    completedAt: (0, pg_core_1.timestamp)("completed_at").defaultNow().notNull(),
    userId: (0, pg_core_1.integer)("user_id")
        .notNull()
        .references(() => exports.users.id, { onDelete: "cascade" }),
});
exports.insertCompletionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.completions).omit({
    id: true,
});
