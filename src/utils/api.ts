const API_BASE_URL = 'https://api.firstwin.top';

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('admin_token');
  
  // Don't set Content-Type for FormData
  const isFormData = options.body instanceof FormData;
  
  const config: RequestInit = {
    ...options,
    headers: {
      // Only set Content-Type for JSON requests
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      // Always set Authorization if token exists
      ...(token && { Authorization: `Bearer ${token}` }),
      // Allow overriding headers from options
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};