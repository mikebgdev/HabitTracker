import type {Express} from "express";
import {createServer, type Server} from "http";
import {storage} from "../db/storage";
import {hashPassword, verifyPassword, generateToken, verifyToken} from "./auth";
import {
    insertUserSchema,
    loginUserSchema,
    insertRoutineSchema,
    insertGroupSchema,
    insertWeekdayScheduleSchema,
    insertCompletionSchema,
    completions,
    weekdaySchedules,
    routines
} from "../../../../shared/schema";
import {db} from "../db/db";
import {eq, and, sql, inArray} from "drizzle-orm";
import express from "express";

const authenticate = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({message: "Unauthorized - No token provided"});
        }

        const token = authHeader.split(" ")[1];
        const payload = verifyToken(token);

        if (!payload) {
            return res.status(401).json({message: "Unauthorized - Invalid token"});
        }

        const user = await storage.getUser(payload.userId);

        if (!user) {
            return res.status(401).json({message: "Unauthorized - User not found"});
        }

        (req as any).user = user;
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(401).json({message: "Unauthorized - Authentication failed"});
    }
};

export async function registerRoutes(app: Express): Promise<Server> {
    const httpServer = createServer(app);


    app.post("/api/auth/google-user", async (req, res) => {
        try {
            const {email, displayName, uid} = req.body;

            if (!email || !uid) {
                return res.status(400).json({message: "Email and UID are required"});
            }

            let user = await storage.getUserByUsername(email);

            if (!user) {

                const newUser = await storage.createUser({
                    username: email,
                    email: email,
                    password: uid,
                });

                const token = generateToken({userId: newUser.id});

                return res.status(201).json({
                    message: "User created successfully",
                    user: {
                        id: newUser.id,
                        email: newUser.email,
                        username: newUser.username
                    },
                    token
                });
            }

            const token = generateToken({userId: user.id});

            return res.status(200).json({
                message: "User logged in successfully",
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username
                },
                token
            });
        } catch (error) {
            console.error("Google user authentication error:", error);
            return res.status(500).json({message: "Failed to authenticate user"});
        }
    });

    app.post("/api/auth/register", async (req, res) => {
        try {
            const validation = insertUserSchema.safeParse(req.body);

            if (!validation.success) {
                return res.status(400).json({message: "Invalid request data", errors: validation.error.format()});
            }

            const {username, password, email} = validation.data;

            const existingUser = await storage.getUserByUsername(username);

            if (existingUser) {
                return res.status(409).json({message: "Username already exists"});
            }

            const hashedPassword = await hashPassword(password);

            const user = await storage.createUser({
                username,
                password: hashedPassword,
                email
            });

            const token = generateToken({userId: user.id});

            const {password: _, ...userWithoutPassword} = user;

            res.status(201).json({
                ...userWithoutPassword,
                token
            });
        } catch (error) {
            console.error("Registration error:", error);
            res.status(500).json({message: "Failed to register user"});
        }
    });

    app.post("/api/auth/login", async (req, res) => {
        try {
            const validation = loginUserSchema.safeParse(req.body);

            if (!validation.success) {
                return res.status(400).json({message: "Invalid request data", errors: validation.error.format()});
            }

            const {username, password} = validation.data;

            const user = await storage.getUserByUsername(username);

            if (!user) {
                return res.status(401).json({message: "Invalid username or password"});
            }

            const isPasswordValid = await verifyPassword(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({message: "Invalid username or password"});
            }

            const token = generateToken({userId: user.id});

            const {password: _, ...userWithoutPassword} = user;

            res.json({
                ...userWithoutPassword,
                token
            });
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({message: "Failed to login"});
        }
    });

    app.get("/api/auth/me", authenticate, (req, res) => {

        const user = (req as any).user;

        const {password: _, ...userWithoutPassword} = user;

        res.json(userWithoutPassword);
    });

    app.post("/api/auth/logout", (req, res) => {


        res.json({message: "Logout successful"});
    });

    app.get("/api/routines", authenticate, async (req, res) => {
        try {
            const userId = (req as any).user.id;
            const routines = await storage.getRoutinesByUserId(userId);
            res.json(routines);
        } catch (error) {
            console.error("Error fetching routines:", error);
            res.status(500).json({message: "Failed to fetch routines"});
        }
    });

    app.post("/api/routines", authenticate, async (req, res) => {
        try {
            const userId = (req as any).user.id;

            const routineData = {...req.body, userId};
            const validation = insertRoutineSchema.safeParse(routineData);

            if (!validation.success) {
                return res.status(400).json({message: "Invalid routine data", errors: validation.error.format()});
            }

            const routine = await storage.createRoutine(validation.data);

            if (req.body.weekdays) {
                const weekdaySchedule = {
                    routineId: routine.id,
                    ...req.body.weekdays
                };

                await storage.createWeekdaySchedule(weekdaySchedule);
            }

            if (req.body.groupId) {
                await storage.addRoutineToGroup(routine.id, req.body.groupId);
            }

            res.status(201).json(routine);
        } catch (error) {
            console.error("Error creating routine:", error);
            res.status(500).json({message: "Failed to create routine"});
        }
    });

    app.get("/api/routines/:id", authenticate, async (req, res) => {
        try {
            const routineId = parseInt(req.params.id);
            const userId = (req as any).user.id;

            const routine = await storage.getRoutineById(routineId);

            if (!routine) {
                return res.status(404).json({message: "Routine not found"});
            }

            if (routine.userId !== userId) {
                return res.status(403).json({message: "Forbidden - You don't have access to this routine"});
            }

            res.json(routine);
        } catch (error) {
            console.error("Error fetching routine:", error);
            res.status(500).json({message: "Failed to fetch routine"});
        }
    });

    app.get("/api/routines/weekday-schedule/:routineId", authenticate, async (req, res) => {
        try {
            const routineId = parseInt(req.params.routineId);
            if (isNaN(routineId)) {
                return res.status(400).json({message: "Invalid routine ID"});
            }

            const userId = (req as any).user.id;

            const routine = await storage.getRoutineById(routineId);
            if (!routine) {
                return res.status(404).json({message: "Routine not found"});
            }

            if (routine.userId !== userId) {
                return res.status(403).json({message: "Forbidden - You don't have access to this routine"});
            }

            const weekdaySchedule = await storage.getWeekdayScheduleByRoutineId(routineId);
            if (!weekdaySchedule) {

                return res.json({
                    monday: false,
                    tuesday: false,
                    wednesday: false,
                    thursday: false,
                    friday: false,
                    saturday: false,
                    sunday: false
                });
            }

            res.json(weekdaySchedule);
        } catch (error) {
            console.error("Error fetching weekday schedule:", error);
            res.status(500).json({message: "Failed to fetch weekday schedule"});
        }
    });

    app.get("/api/routines/weekday-schedule", authenticate, async (req, res) => {
        try {
            const userId = (req as any).user.id;

            const userRoutines = await storage.getRoutinesByUserId(userId);

            const schedules = [];

            for (const routine of userRoutines) {
                try {

                    const existingSchedules = await db
                        .select()
                        .from(weekdaySchedules)
                        .where(eq(weekdaySchedules.routineId, routine.id));

                    if (existingSchedules && existingSchedules.length > 0) {

                        schedules.push(existingSchedules[0]);
                    } else {

                        schedules.push({
                            id: 0,
                            routineId: routine.id,
                            monday: false,
                            tuesday: false,
                            wednesday: false,
                            thursday: false,
                            friday: false,
                            saturday: false,
                            sunday: false
                        });
                    }
                } catch (err) {
                    console.error(`Error al obtener horario para rutina ${routine.id}:`, err);

                    schedules.push({
                        id: 0,
                        routineId: routine.id,
                        monday: false,
                        tuesday: false,
                        wednesday: false,
                        thursday: false,
                        friday: false,
                        saturday: false,
                        sunday: false
                    });
                }
            }

            res.json(schedules);
        } catch (error) {
            console.error("Error fetching all weekday schedules:", error);
            res.status(500).json({message: "Failed to fetch weekday schedules"});
        }
    });

    app.patch("/api/routines/:id/archive", authenticate, async (req, res) => {
        try {
            const routineId = parseInt(req.params.id);
            const userId = (req as any).user.id;

            const routine = await storage.getRoutineById(routineId);

            if (!routine) {
                return res.status(404).json({message: "Routine not found"});
            }

            if (routine.userId !== userId) {
                return res.status(403).json({message: "Unauthorized"});
            }

            const updatedRoutine = await storage.updateRoutine(routineId, {
                archived: true,
                archivedAt: new Date(),
            });

            res.json({message: "Routine archived successfully", routine: updatedRoutine});
        } catch (error) {
            console.error("Error archiving routine:", error);
            res.status(500).json({message: "Failed to archive routine"});
        }
    });

    app.patch("/api/routines/:id/unarchive", authenticate, async (req, res) => {
        try {
            const routineId = parseInt(req.params.id);
            const userId = (req as any).user.id;

            const routine = await storage.getRoutineById(routineId);

            if (!routine) {
                return res.status(404).json({message: "Routine not found"});
            }

            if (routine.userId !== userId) {
                return res.status(403).json({message: "Unauthorized"});
            }

            const updatedRoutine = await storage.updateRoutine(routineId, {
                archived: false,
                archivedAt: null,
            });

            res.json({message: "Routine unarchived successfully", routine: updatedRoutine});
        } catch (error) {
            console.error("Error unarchiving routine:", error);
            res.status(500).json({message: "Failed to unarchive routine"});
        }
    });

    app.patch("/api/routines/:id", authenticate, async (req, res) => {
        try {
            const routineId = parseInt(req.params.id);
            const userId = (req as any).user.id;

            const existingRoutine = await storage.getRoutineById(routineId);

            if (!existingRoutine) {
                return res.status(404).json({message: "Routine not found"});
            }

            if (existingRoutine.userId !== userId) {
                return res.status(403).json({message: "Forbidden - You don't have access to this routine"});
            }

            const updatedRoutine = await storage.updateRoutine(routineId, req.body);

            if (req.body.weekdays) {
                await storage.updateWeekdaySchedule(routineId, req.body.weekdays);
            }

            if (req.body.groupId !== undefined) {

                const groupRoutines = await storage.getAllGroupRoutines();
                const existingRelation = groupRoutines.find((gr) => gr.routineId === routineId);

                if (existingRelation) {
                    await storage.removeRoutineFromGroup(routineId, existingRelation.groupId);
                }

                if (req.body.groupId !== null) {
                    await storage.addRoutineToGroup(routineId, req.body.groupId);
                }
            }

            res.json(updatedRoutine);
        } catch (error) {
            console.error("Error updating routine:", error);
            res.status(500).json({message: "Failed to update routine"});
        }
    });

    app.delete("/api/routines/:id", authenticate, async (req, res) => {
        try {
            const routineId = parseInt(req.params.id);
            const userId = (req as any).user.id;

            const existingRoutine = await storage.getRoutineById(routineId);

            if (!existingRoutine) {
                return res.status(404).json({message: "Routine not found"});
            }

            if (existingRoutine.userId !== userId) {
                return res.status(403).json({message: "Forbidden - You don't have access to this routine"});
            }

            await storage.deleteRoutine(routineId);

            res.json({message: "Routine deleted successfully"});
        } catch (error) {
            console.error("Error deleting routine:", error);
            res.status(500).json({message: "Failed to delete routine"});
        }
    });

    app.get("/api/routines/daily/:date", authenticate, async (req, res) => {
        try {
            const userId = (req as any).user.id;
            const date = req.params.date || new Date().toISOString().split('T')[0];

            const routinesByGroup = await storage.getDailyRoutinesByGroup(userId, date);

            res.json(routinesByGroup);
        } catch (error) {
            console.error("Error fetching daily routines:", error);
            res.status(500).json({message: "Failed to fetch daily routines"});
        }
    });

    app.get("/api/routines/daily/flat/:date", authenticate, async (req, res) => {
        try {
            const userId = (req as any).user.id;
            const date = req.params.date || new Date().toISOString().split('T')[0];

            const routines = await storage.getDailyRoutines(userId, date);

            res.json(routines);
        } catch (error) {
            console.error("Error fetching daily routines:", error);
            res.status(500).json({message: "Failed to fetch daily routines"});
        }
    });

    app.get("/api/groups", authenticate, async (req, res) => {
        try {
            const userId = (req as any).user.id;
            const groups = await storage.getGroupsByUserId(userId);
            res.json(groups);
        } catch (error) {
            console.error("Error fetching groups:", error);
            res.status(500).json({message: "Failed to fetch groups"});
        }
    });

    app.post("/api/groups", authenticate, async (req, res) => {
        try {
            const userId = (req as any).user.id;

            const groupData = {...req.body, userId};
            const validation = insertGroupSchema.safeParse(groupData);

            if (!validation.success) {
                return res.status(400).json({message: "Invalid group data", errors: validation.error.format()});
            }

            const group = await storage.createGroup(validation.data);

            res.status(201).json(group);
        } catch (error) {
            console.error("Error creating group:", error);
            res.status(500).json({message: "Failed to create group"});
        }
    });

    app.get("/api/groups/:id", authenticate, async (req, res) => {
        try {
            const groupId = parseInt(req.params.id);
            const userId = (req as any).user.id;

            const group = await storage.getGroupById(groupId);

            if (!group) {
                return res.status(404).json({message: "Group not found"});
            }

            if (group.userId !== userId) {
                return res.status(403).json({message: "Forbidden - You don't have access to this group"});
            }

            res.json(group);
        } catch (error) {
            console.error("Error fetching group:", error);
            res.status(500).json({message: "Failed to fetch group"});
        }
    });

    app.patch("/api/groups/:id", authenticate, async (req, res) => {
        try {
            const groupId = parseInt(req.params.id);
            const userId = (req as any).user.id;

            const existingGroup = await storage.getGroupById(groupId);

            if (!existingGroup) {
                return res.status(404).json({message: "Group not found"});
            }

            if (existingGroup.userId !== userId) {
                return res.status(403).json({message: "Forbidden - You don't have access to this group"});
            }

            const updatedGroup = await storage.updateGroup(groupId, req.body);

            res.json(updatedGroup);
        } catch (error) {
            console.error("Error updating group:", error);
            res.status(500).json({message: "Failed to update group"});
        }
    });

    app.delete("/api/groups/:id", authenticate, async (req, res) => {
        try {
            const groupId = parseInt(req.params.id);
            const userId = (req as any).user.id;

            const existingGroup = await storage.getGroupById(groupId);

            if (!existingGroup) {
                return res.status(404).json({message: "Group not found"});
            }

            if (existingGroup.userId !== userId) {
                return res.status(403).json({message: "Forbidden - You don't have access to this group"});
            }

            await storage.deleteGroup(groupId);

            res.json({message: "Group deleted successfully"});
        } catch (error) {
            console.error("Error deleting group:", error);
            res.status(500).json({message: "Failed to delete group"});
        }
    });

    app.get("/api/groups/:id/routines", authenticate, async (req, res) => {
        try {
            const groupId = parseInt(req.params.id);
            const userId = (req as any).user.id;

            const group = await storage.getGroupById(groupId);

            if (!group) {
                return res.status(404).json({message: "Group not found"});
            }

            if (group.userId !== userId) {
                return res.status(403).json({message: "Forbidden - You don't have access to this group"});
            }

            const routines = await storage.getRoutinesByGroupId(groupId);

            res.json(routines);
        } catch (error) {
            console.error("Error fetching group routines:", error);
            res.status(500).json({message: "Failed to fetch group routines"});
        }
    });

    app.get("/api/group-routines", authenticate, async (req, res) => {
        try {
            const userId = (req as any).user.id;

            const userGroups = await storage.getGroupsByUserId(userId);

            const routineGroupAssignments = [];

            const allGroupRoutines = await storage.getAllGroupRoutines();

            for (const group of userGroups) {
                const groupRelations = allGroupRoutines.filter(gr => gr.groupId === group.id);

                if (groupRelations.length > 0) {
                    groupRelations.forEach(relation => {
                        routineGroupAssignments.push({
                            groupId: group.id,
                            groupName: group.name,
                            groupIcon: group.icon,
                            routineId: relation.routineId
                        });
                    });
                } else {
                    routineGroupAssignments.push({
                        groupId: group.id,
                        groupName: group.name,
                        groupIcon: group.icon,
                        count: 0
                    });
                }
            }

            res.json(routineGroupAssignments);
        } catch (error) {
            console.error("Error fetching routine-group relationships:", error);
            res.status(500).json({message: "Failed to fetch routine-group relationships"});
        }
    });

    app.get("/api/groups/routines/:id/:date", authenticate, async (req, res) => {
        try {
            const groupId = parseInt(req.params.id);
            const userId = (req as any).user.id;
            const date = req.params.date || new Date().toISOString().split('T')[0];

            const group = await storage.getGroupById(groupId);

            if (!group) {
                return res.status(404).json({message: "Group not found"});
            }

            if (group.userId !== userId) {
                return res.status(403).json({message: "Forbidden - You don't have access to this group"});
            }

            const routines = await storage.getRoutinesByGroupIdAndDate(groupId, date);

            res.json(routines);
        } catch (error) {
            console.error("Error fetching group routines:", error);
            res.status(500).json({message: "Failed to fetch group routines"});
        }
    });

    app.post("/api/completions", authenticate, async (req, res) => {
        try {
            const userId = (req as any).user.id;

            const completionData = {
                routineId: parseInt(req.body.routineId),
                userId,
                completedAt: new Date()
            };

            const routine = await storage.getRoutineById(completionData.routineId);

            if (!routine) {
                return res.status(404).json({message: "Routine not found"});
            }

            if (routine.userId !== userId) {
                return res.status(403).json({message: "Forbidden - You don't have access to this routine"});
            }

            const [completion] = await db
                .insert(completions)
                .values(completionData)
                .returning();

            res.status(201).json(completion);
        } catch (error) {
            console.error("Error creating completion:", error);
            res.status(500).json({message: "Failed to mark routine as completed"});
        }
    });

    app.delete("/api/completions", authenticate, async (req, res) => {
        try {
            const userId = (req as any).user.id;
            const {routineId, date} = req.body;

            if (!routineId || !date) {
                return res.status(400).json({message: "routineId and date are required"});
            }

            const routine = await storage.getRoutineById(routineId);

            if (!routine) {
                return res.status(404).json({message: "Routine not found"});
            }

            if (routine.userId !== userId) {
                return res.status(403).json({message: "Forbidden - You don't have access to this routine"});
            }

            await storage.deleteCompletion(routineId, date);

            res.json({message: "Completion removed successfully"});
        } catch (error) {
            console.error("Error deleting completion:", error);
            res.status(500).json({message: "Failed to remove completion"});
        }
    });

    app.delete("/api/completions/:routineId/:date", authenticate, async (req, res) => {
        try {
            const userId = (req as any).user.id;
            const routineId = parseInt(req.params.routineId);
            const date = req.params.date;

            if (isNaN(routineId) || !date) {
                return res.status(400).json({message: "Valid routineId and date are required"});
            }

            const routine = await storage.getRoutineById(routineId);

            if (!routine) {
                return res.status(404).json({message: "Routine not found"});
            }

            if (routine.userId !== userId) {
                return res.status(403).json({message: "Forbidden - You don't have access to this routine"});
            }

            await storage.deleteCompletion(routineId, date);

            res.json({message: "Completion removed successfully"});
        } catch (error) {
            console.error("Error deleting completion:", error);
            res.status(500).json({message: "Failed to remove completion"});
        }
    });

    app.post("/api/completions/group", authenticate, async (req, res) => {
        try {
            const userId = (req as any).user.id;
            const {groupId, date} = req.body;

            if (!groupId || !date) {
                return res.status(400).json({message: "groupId and date are required"});
            }

            const group = await storage.getGroupById(groupId);

            if (!group) {
                return res.status(404).json({message: "Group not found"});
            }

            if (group.userId !== userId) {
                return res.status(403).json({message: "Forbidden - You don't have access to this group"});
            }

            const routines = await storage.getRoutinesByGroupIdAndDate(groupId, date);

            const completions = [];
            for (const routine of routines) {

                if (routine.completedAt) continue;

                const completion = await storage.createCompletion({
                    routineId: routine.id,
                    userId,
                    completedAt: new Date()
                });

                completions.push(completion);
            }

            res.status(201).json(completions);
        } catch (error) {
            console.error("Error completing group routines:", error);
            res.status(500).json({message: "Failed to complete group routines"});
        }
    });

    app.get("/api/completions/stats/:startDate/:endDate", authenticate, async (req, res) => {
        try {
            const userId = (req as any).user.id;
            const {startDate, endDate} = req.params;

            if (!startDate || !endDate) {
                return res.status(400).json({message: "startDate and endDate are required"});
            }

            const stats = await storage.getCompletionStats(userId, startDate, endDate);

            res.json(stats);
        } catch (error) {
            console.error("Error fetching completion stats:", error);
            res.status(500).json({message: "Failed to fetch completion statistics"});
        }
    });

    app.get("/api/completions/:date", authenticate, async (req, res) => {
        try {
            const userId = (req as any).user.id;
            const date = req.params.date || new Date().toISOString().split('T')[0];


            const result = await db
                .select()
                .from(completions)
                .where(
                    and(
                        eq(completions.userId, userId)
                    )
                );

            res.json(result);
        } catch (error) {
            console.error("Error fetching completions:", error);
            res.status(500).json({message: "Failed to fetch completions"});
        }
    });

    app.post("/api/routines/:id/assign-group", authenticate, async (req, res) => {
        try {
            const routineId = parseInt(req.params.id);
            const userId = (req as any).user.id;
            const {groupId} = req.body;

            const routine = await storage.getRoutineById(routineId);

            if (!routine) {
                return res.status(404).json({message: "Routine not found"});
            }

            if (routine.userId !== userId) {
                return res.status(403).json({message: "Forbidden - You don't have access to this routine"});
            }

            const groupRoutines = await storage.getAllGroupRoutines();

            const existingAssignment = groupRoutines.find(gr => gr.routineId === routineId);

            if (existingAssignment) {
                await storage.removeRoutineFromGroup(routineId, existingAssignment.groupId);
            }

            if (groupId !== null && groupId !== undefined) {

                const group = await storage.getGroupById(groupId);

                if (!group) {
                    return res.status(404).json({message: "Group not found"});
                }

                if (group.userId !== userId) {
                    return res.status(403).json({message: "Forbidden - You don't have access to this group"});
                }

                await storage.addRoutineToGroup(routineId, groupId);
            }

            res.json({
                success: true,
                message: groupId !== null && groupId !== undefined
                    ? "Routine assigned to group successfully"
                    : "Routine removed from group successfully"
            });
        } catch (error) {
            console.error("Error assigning group to routine:", error);
            res.status(500).json({message: "Failed to assign group to routine"});
        }
    });

    app.get("/api/completions", authenticate, async (req, res) => {
        try {
            const userId = (req as any).user.id;

            const result = await db
                .select()
                .from(completions)
                .where(eq(completions.userId, userId));

            res.json(result);
        } catch (error) {
            console.error("Error fetching completions:", error);
            res.status(500).json({message: "Failed to fetch completions"});
        }
    });

    return httpServer;
}
