import { format, isToday, isYesterday, isTomorrow, formatDistanceToNow } from "date-fns";

/**
 * Format a date for display
 * @param date The date to format
 * @param formatStr Optional format string
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string, formatStr?: string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (formatStr) {
    return format(dateObj, formatStr);
  }
  
  if (isToday(dateObj)) {
    return `Today, ${format(dateObj, "h:mm a")}`;
  }
  
  if (isYesterday(dateObj)) {
    return `Yesterday, ${format(dateObj, "h:mm a")}`;
  }
  
  if (isTomorrow(dateObj)) {
    return `Tomorrow, ${format(dateObj, "h:mm a")}`;
  }
  
  return format(dateObj, "MMMM d, yyyy");
};

/**
 * Format a time in 24-hour format (HH:MM) to 12-hour format with AM/PM
 * @param timeString Time string in HH:MM format
 * @returns Time in 12-hour format with AM/PM
 */
export const formatTime = (timeString: string): string => {
  if (!timeString) return "";
  
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  
  return `${hour12}:${minutes} ${ampm}`;
};

/**
 * Get a human-readable time ago string
 * @param date The date to format
 * @returns Human-readable time ago string
 */
export const timeAgo = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

/**
 * Check if a routine is scheduled for today based on weekday schedule
 * @param weekdaySchedule Object containing weekday booleans
 * @returns Boolean indicating if routine is scheduled for today
 */
export const isScheduledForToday = (weekdaySchedule: Record<string, boolean>): boolean => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  const dayMap: Record<number, string> = {
    0: "sunday",
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday"
  };
  
  return !!weekdaySchedule[dayMap[dayOfWeek]];
};

/**
 * Get the current weekday name (monday, tuesday, etc.)
 * @returns The current weekday name in lowercase
 */
export const getCurrentWeekday = (): string => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  const dayMap: Record<number, string> = {
    0: "sunday",
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday"
  };
  
  return dayMap[dayOfWeek];
};
