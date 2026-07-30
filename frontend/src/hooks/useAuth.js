import { useState, useEffect } from 'react';
import api from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists, then fetch user profile
    const token = localStorage.getItem('access_token');
    if (token) {
      api.get('/profile/')
        .then(response => {
          setUser(response.data);
        })
        .catch(error => {
          console.error("Error fetching profile", error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/login/', { email, password });
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    
    // Optionally fetch profile immediately after login
    const profileRes = await api.get('/profile/');
    setUser(profileRes.data);
    return profileRes.data;
  };

  const register = async (userData) => {
    const response = await api.post('/register/', userData);
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/logout/');
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    }
  };

  return { user, loading, login, register, logout };
};
