import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { hashPassword, verifyPassword, generateToken, verifyToken } from "./auth";
import { insertUserSchema, loginUserSchema, insertRoutineSchema, insertGroupSchema, insertWeekdayScheduleSchema, insertCompletionSchema } from "@shared/schema";
import express from "express";

// Middleware to validate authentication
const authenticate = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }
    
    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    
    if (!payload) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
    
    const user = await storage.getUser(payload.userId);
    
    if (!user) {
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }
    
    // Attach user to request object
    (req as any).user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Unauthorized - Authentication failed" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validation = insertUserSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid request data", errors: validation.error.format() });
      }
      
      const { username, password, email } = validation.data;
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create user
      const user = await storage.createUser({ 
        username, 
        password: hashedPassword,
        email 
      });
      
      // Generate token
      const token = generateToken({ userId: user.id });
      
      // Filter out password before sending response
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(201).json({
        ...userWithoutPassword,
        token
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validation = loginUserSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid request data", errors: validation.error.format() });
      }
      
      const { username, password } = validation.data;
      
      // Find user
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Verify password
      const isPasswordValid = await verifyPassword(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Generate token
      const token = generateToken({ userId: user.id });
      
      // Filter out password before sending response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        ...userWithoutPassword,
        token
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });
  
  app.get("/api/auth/me", authenticate, (req, res) => {
    // User is already attached to request by the authenticate middleware
    const user = (req as any).user;
    
    // Filter out password before sending response
    const { password: _, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  });
  
  app.post("/api/auth/logout", (req, res) => {
    // In a real implementation, we would invalidate the token
    // For this simple example, we'll just return a success response
    res.json({ message: "Logout successful" });
  });
  
  // Routines routes
  app.get("/api/routines", authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const routines = await storage.getRoutinesByUserId(userId);
      res.json(routines);
    } catch (error) {
      console.error("Error fetching routines:", error);
      res.status(500).json({ message: "Failed to fetch routines" });
    }
  });
  
  app.post("/api/routines", authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      
      // Validate routine data
      const routineData = { ...req.body, userId };
      const validation = insertRoutineSchema.safeParse(routineData);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid routine data", errors: validation.error.format() });
      }
      
      // Create routine
      const routine = await storage.createRoutine(validation.data);
      
      // If weekdays are provided, create weekday schedule
      if (req.body.weekdays) {
        const weekdaySchedule = {
          routineId: routine.id,
          ...req.body.weekdays
        };
        
        await storage.createWeekdaySchedule(weekdaySchedule);
      }
      
      // If groupId is provided, add routine to group
      if (req.body.groupId) {
        await storage.addRoutineToGroup(routine.id, req.body.groupId);
      }
      
      res.status(201).json(routine);
    } catch (error) {
      console.error("Error creating routine:", error);
      res.status(500).json({ message: "Failed to create routine" });
    }
  });
  
  app.get("/api/routines/:id", authenticate, async (req, res) => {
    try {
      const routineId = parseInt(req.params.id);
      const userId = (req as any).user.id;
      
      const routine = await storage.getRoutineById(routineId);
      
      if (!routine) {
        return res.status(404).json({ message: "Routine not found" });
      }
      
      // Check if routine belongs to user
      if (routine.userId !== userId) {
        return res.status(403).json({ message: "Forbidden - You don't have access to this routine" });
      }
      
      res.json(routine);
    } catch (error) {
      console.error("Error fetching routine:", error);
      res.status(500).json({ message: "Failed to fetch routine" });
    }
  });
  
  // Ruta para obtener la programación de días de la semana de una rutina
  app.get("/api/routines/weekday-schedule/:routineId", authenticate, async (req, res) => {
    try {
      const routineId = parseInt(req.params.routineId);
      if (isNaN(routineId)) {
        return res.status(400).json({ message: "Invalid routine ID" });
      }
      
      const userId = (req as any).user.id;
      
      // Verificar que la rutina pertenezca al usuario
      const routine = await storage.getRoutineById(routineId);
      if (!routine) {
        return res.status(404).json({ message: "Routine not found" });
      }
      
      if (routine.userId !== userId) {
        return res.status(403).json({ message: "Forbidden - You don't have access to this routine" });
      }
      
      // Obtener la programación de días de la semana
      const weekdaySchedule = await storage.getWeekdayScheduleByRoutineId(routineId);
      if (!weekdaySchedule) {
        // Si no hay programación, devolver un objeto con todos los días en false
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
      res.status(500).json({ message: "Failed to fetch weekday schedule" });
    }
  });
  
  app.patch("/api/routines/:id", authenticate, async (req, res) => {
    try {
      const routineId = parseInt(req.params.id);
      const userId = (req as any).user.id;
      
      // Check if routine exists and belongs to user
      const existingRoutine = await storage.getRoutineById(routineId);
      
      if (!existingRoutine) {
        return res.status(404).json({ message: "Routine not found" });
      }
      
      if (existingRoutine.userId !== userId) {
        return res.status(403).json({ message: "Forbidden - You don't have access to this routine" });
      }
      
      // Update routine
      const updatedRoutine = await storage.updateRoutine(routineId, req.body);
      
      // If weekdays are provided, update weekday schedule
      if (req.body.weekdays) {
        await storage.updateWeekdaySchedule(routineId, req.body.weekdays);
      }
      
      res.json(updatedRoutine);
    } catch (error) {
      console.error("Error updating routine:", error);
      res.status(500).json({ message: "Failed to update routine" });
    }
  });
  
  app.delete("/api/routines/:id", authenticate, async (req, res) => {
    try {
      const routineId = parseInt(req.params.id);
      const userId = (req as any).user.id;
      
      // Check if routine exists and belongs to user
      const existingRoutine = await storage.getRoutineById(routineId);
      
      if (!existingRoutine) {
        return res.status(404).json({ message: "Routine not found" });
      }
      
      if (existingRoutine.userId !== userId) {
        return res.status(403).json({ message: "Forbidden - You don't have access to this routine" });
      }
      
      // Delete routine
      await storage.deleteRoutine(routineId);
      
      res.json({ message: "Routine deleted successfully" });
    } catch (error) {
      console.error("Error deleting routine:", error);
      res.status(500).json({ message: "Failed to delete routine" });
    }
  });
  
  // Daily routines route
  app.get("/api/routines/daily/:date?", authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const date = req.params.date || new Date().toISOString().split('T')[0]; // Default to today
      
      const routinesByGroup = await storage.getDailyRoutinesByGroup(userId, date);
      
      res.json(routinesByGroup);
    } catch (error) {
      console.error("Error fetching daily routines:", error);
      res.status(500).json({ message: "Failed to fetch daily routines" });
    }
  });
  
  app.get("/api/routines/daily/flat/:date?", authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const date = req.params.date || new Date().toISOString().split('T')[0]; // Default to today
      
      const routines = await storage.getDailyRoutines(userId, date);
      
      res.json(routines);
    } catch (error) {
      console.error("Error fetching daily routines:", error);
      res.status(500).json({ message: "Failed to fetch daily routines" });
    }
  });
  
  // Groups routes
  app.get("/api/groups", authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const groups = await storage.getGroupsByUserId(userId);
      res.json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });
  
  app.post("/api/groups", authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      
      // Validate group data
      const groupData = { ...req.body, userId };
      const validation = insertGroupSchema.safeParse(groupData);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid group data", errors: validation.error.format() });
      }
      
      // Create group
      const group = await storage.createGroup(validation.data);
      
      res.status(201).json(group);
    } catch (error) {
      console.error("Error creating group:", error);
      res.status(500).json({ message: "Failed to create group" });
    }
  });
  
  app.get("/api/groups/:id", authenticate, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const userId = (req as any).user.id;
      
      const group = await storage.getGroupById(groupId);
      
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      // Check if group belongs to user
      if (group.userId !== userId) {
        return res.status(403).json({ message: "Forbidden - You don't have access to this group" });
      }
      
      res.json(group);
    } catch (error) {
      console.error("Error fetching group:", error);
      res.status(500).json({ message: "Failed to fetch group" });
    }
  });
  
  app.patch("/api/groups/:id", authenticate, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const userId = (req as any).user.id;
      
      // Check if group exists and belongs to user
      const existingGroup = await storage.getGroupById(groupId);
      
      if (!existingGroup) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      if (existingGroup.userId !== userId) {
        return res.status(403).json({ message: "Forbidden - You don't have access to this group" });
      }
      
      // Update group
      const updatedGroup = await storage.updateGroup(groupId, req.body);
      
      res.json(updatedGroup);
    } catch (error) {
      console.error("Error updating group:", error);
      res.status(500).json({ message: "Failed to update group" });
    }
  });
  
  app.delete("/api/groups/:id", authenticate, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const userId = (req as any).user.id;
      
      // Check if group exists and belongs to user
      const existingGroup = await storage.getGroupById(groupId);
      
      if (!existingGroup) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      if (existingGroup.userId !== userId) {
        return res.status(403).json({ message: "Forbidden - You don't have access to this group" });
      }
      
      // Delete group
      await storage.deleteGroup(groupId);
      
      res.json({ message: "Group deleted successfully" });
    } catch (error) {
      console.error("Error deleting group:", error);
      res.status(500).json({ message: "Failed to delete group" });
    }
  });
  
  app.get("/api/groups/:id/routines", authenticate, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const userId = (req as any).user.id;
      
      // Check if group belongs to user
      const group = await storage.getGroupById(groupId);
      
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      if (group.userId !== userId) {
        return res.status(403).json({ message: "Forbidden - You don't have access to this group" });
      }
      
      // Get routines in this group
      const routines = await storage.getRoutinesByGroupId(groupId);
      
      res.json(routines);
    } catch (error) {
      console.error("Error fetching group routines:", error);
      res.status(500).json({ message: "Failed to fetch group routines" });
    }
  });
  
  // Get routine-group relationships with group names
  app.get("/api/group-routines", authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      
      // Get all groups for the user
      const userGroups = await storage.getGroupsByUserId(userId);
      
      // Array to store routine-group assignments
      const routineGroupAssignments = [];
      
      // For each group, get the routines and build the relationships
      for (const group of userGroups) {
        console.log(`Getting routines for group ${group.id} (${group.name})`);
        
        // Fetch all routines that belong to this group
        const routinesInGroup = await storage.getRoutinesByGroupId(group.id);
        console.log(`Found ${routinesInGroup.length} routines in group ${group.id}`);
        
        // Add an entry for each routine with group info
        if (routinesInGroup.length > 0) {
          routinesInGroup.forEach(routine => {
            console.log(`Adding routine ${routine.id} to group ${group.id}`);
            routineGroupAssignments.push({
              groupId: group.id,
              groupName: group.name,
              groupIcon: group.icon,
              routineId: routine.id
            });
          });
        } else {
          // Even if there are no routines, add an entry for the group
          console.log(`No routines found in group ${group.id}, adding empty record`);
          routineGroupAssignments.push({
            groupId: group.id,
            groupName: group.name,
            groupIcon: group.icon,
            count: 0
          });
        }
      }
      
      console.log(`Returning ${routineGroupAssignments.length} group-routine assignments`);
      console.log(routineGroupAssignments);
      res.json(routineGroupAssignments);
    } catch (error) {
      console.error("Error fetching routine-group relationships:", error);
      res.status(500).json({ message: "Failed to fetch routine-group relationships" });
    }
  });
  
  // Group routines for a specific date
  app.get("/api/groups/routines/:id/:date?", authenticate, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const userId = (req as any).user.id;
      const date = req.params.date || new Date().toISOString().split('T')[0]; // Default to today
      
      // Check if group belongs to user
      const group = await storage.getGroupById(groupId);
      
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      if (group.userId !== userId) {
        return res.status(403).json({ message: "Forbidden - You don't have access to this group" });
      }
      
      // Get routines for this group and date
      const routines = await storage.getRoutinesByGroupIdAndDate(groupId, date);
      
      res.json(routines);
    } catch (error) {
      console.error("Error fetching group routines:", error);
      res.status(500).json({ message: "Failed to fetch group routines" });
    }
  });
  
  // Completions routes
  app.post("/api/completions", authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      
      // Validate completion data
      const completionData = { 
        ...req.body, 
        userId,
        completedAt: new Date() 
      };
      
      const validation = insertCompletionSchema.safeParse(completionData);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid completion data", errors: validation.error.format() });
      }
      
      // Check if routine belongs to user
      const routine = await storage.getRoutineById(completionData.routineId);
      
      if (!routine) {
        return res.status(404).json({ message: "Routine not found" });
      }
      
      if (routine.userId !== userId) {
        return res.status(403).json({ message: "Forbidden - You don't have access to this routine" });
      }
      
      // Create completion
      const completion = await storage.createCompletion(validation.data);
      
      res.status(201).json(completion);
    } catch (error) {
      console.error("Error creating completion:", error);
      res.status(500).json({ message: "Failed to mark routine as completed" });
    }
  });
  
  app.delete("/api/completions", authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { routineId, date } = req.body;
      
      if (!routineId || !date) {
        return res.status(400).json({ message: "routineId and date are required" });
      }
      
      // Check if routine belongs to user
      const routine = await storage.getRoutineById(routineId);
      
      if (!routine) {
        return res.status(404).json({ message: "Routine not found" });
      }
      
      if (routine.userId !== userId) {
        return res.status(403).json({ message: "Forbidden - You don't have access to this routine" });
      }
      
      // Delete completion
      await storage.deleteCompletion(routineId, date);
      
      res.json({ message: "Completion removed successfully" });
    } catch (error) {
      console.error("Error deleting completion:", error);
      res.status(500).json({ message: "Failed to remove completion" });
    }
  });
  
  app.post("/api/completions/group", authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { groupId, date } = req.body;
      
      if (!groupId || !date) {
        return res.status(400).json({ message: "groupId and date are required" });
      }
      
      // Check if group belongs to user
      const group = await storage.getGroupById(groupId);
      
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      if (group.userId !== userId) {
        return res.status(403).json({ message: "Forbidden - You don't have access to this group" });
      }
      
      // Get all routines in the group that are scheduled for the given date
      const routines = await storage.getRoutinesByGroupIdAndDate(groupId, date);
      
      // Complete all routines
      const completions = [];
      for (const routine of routines) {
        // Skip already completed routines
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
      res.status(500).json({ message: "Failed to complete group routines" });
    }
  });
  
  app.get("/api/completions/stats/:startDate/:endDate", authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { startDate, endDate } = req.params;
      
      // Validate dates
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate and endDate are required" });
      }
      
      // Get completion statistics
      const stats = await storage.getCompletionStats(userId, startDate, endDate);
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching completion stats:", error);
      res.status(500).json({ message: "Failed to fetch completion statistics" });
    }
  });

  return httpServer;
}
