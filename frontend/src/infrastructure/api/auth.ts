


export const isAuthenticated = (): boolean => {
  const token =
    localStorage.getItem('auth_token') ||
    sessionStorage.getItem('auth_token') ||
    localStorage.getItem('authToken') ||
    sessionStorage.getItem('authToken') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('token');
  return !!token;
};


export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
  localStorage.setItem('auth_token', token);
};


export const removeToken = (): void => {
  localStorage.removeItem('auth_token');
  sessionStorage.removeItem('auth_token');
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
};


export const getToken = (): string | null => {
  return (
    localStorage.getItem('auth_token') ||
    sessionStorage.getItem('auth_token') ||
    localStorage.getItem('authToken') ||
    sessionStorage.getItem('authToken') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('token') ||
    null
  );
};


export const addAuthHeader = (options: RequestInit = {}): RequestInit => {
  const token = getToken();
  if (!token) return options;
  
  return {
    ...options,
    headers: {
      ...options.headers as Record<string, string>,
      'Authorization': `Bearer ${token}`
    }
  };
};