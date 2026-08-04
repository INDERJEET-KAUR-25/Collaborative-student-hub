import axios from 'axios';

// Base URL for the Django backend API
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Token Refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // If error is 401 Unauthorized and we haven't already retried
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          // Attempt to refresh the token
          const res = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh: refreshToken });
          
          if (res.status === 200) {
            // Save the new access token
            localStorage.setItem('access_token', res.data.access);
            
            // Retry the original request with the new token
            api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`;
            originalRequest.headers['Authorization'] = `Bearer ${res.data.access}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh token failed or expired -> logout the user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login'; // Redirect to login
      }
    }
    return Promise.reject(error);
  }
);

export default api;
