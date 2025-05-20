import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines className strings with tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates initials from a name
 * @param name Full name to get initials from
 * @param maxLength Maximum number of characters to return
 * @returns Initials string
 */
export function getInitials(name: string, maxLength: number = 2): string {
  if (!name) return "";
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return name.substring(0, maxLength).toUpperCase();
  }
  
  const initials = parts.map(part => part.charAt(0)).join("");
  return initials.substring(0, maxLength).toUpperCase();
}

/**
 * Calculate completion percentage
 * @param completed Number of completed items
 * @param total Total number of items
 * @returns Percentage as a whole number
 */
export function calculatePercentage(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Determine color variant based on percentage
 * @param percentage Percentage value
 * @returns Color variant name
 */
export function getColorVariantFromPercentage(percentage: number): "success" | "warning" | "danger" {
  if (percentage >= 80) return "success";
  if (percentage >= 50) return "warning";
  return "danger";
}

/**
 * Format a priority value for display
 * @param priority Priority value
 * @returns Formatted priority with capitalized first letter
 */
export function formatPriority(priority: string): string {
  if (!priority) return "";
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

/**
 * Truncates text to a specific length and adds ellipsis if needed
 * @param text Text to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Safely parse JSON with a fallback value
 * @param jsonString JSON string to parse
 * @param fallback Fallback value if parsing fails
 * @returns Parsed JSON or fallback value
 */
export function safeParseJSON<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    return fallback;
  }
}
