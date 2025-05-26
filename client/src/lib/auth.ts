


export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};


export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};


export const removeToken = (): void => {
  localStorage.removeItem('token');
};


export const getToken = (): string | null => {

  return localStorage.getItem('authToken') || 
         localStorage.getItem('token') || null;
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