/**
 * Authentication utility functions for the HabitMaster application
 */

/**
 * Check if a user is authenticated by verifying their token
 * @returns Boolean indicating if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};

/**
 * Store authentication token in local storage
 * @param token JWT token
 */
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

/**
 * Remove authentication token from local storage
 */
export const removeToken = (): void => {
  localStorage.removeItem('token');
};

/**
 * Get the stored authentication token
 * @returns JWT token or null if not found
 */
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};