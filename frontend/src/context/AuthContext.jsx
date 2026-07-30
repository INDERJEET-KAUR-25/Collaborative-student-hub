import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load profile when app starts or token exists
  const loadProfile = async () => {
    try {
      const res = await api.get('/auth/profile/');
      if (res.status === 200) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      loadProfile();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login/', { username, password });
      if (res.status === 200) {
        localStorage.setItem('access_token', res.data.access);
        localStorage.setItem('refresh_token', res.data.refresh);
        // Load the profile details using the newly acquired token
        const profileRes = await api.get('/auth/profile/');
        setUser(profileRes.data);
        return { success: true };
      }
    } catch (err) {
      console.error('Login error:', err);
      setUser(null);
      return { 
        success: false, 
        error: err.response?.data?.detail || 'Invalid username or password.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password, firstName, lastName) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register/', {
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName
      });
      if (res.status === 201) {
        // Auto-login after successful registration
        return await login(username, password);
      }
    } catch (err) {
      console.error('Registration error:', err);
      return { 
        success: false, 
        error: err.response?.data || { detail: 'Registration failed. Try a different username.' } 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('/auth/profile/', profileData);
      if (res.status === 200) {
        setUser(res.data);
        return { success: true };
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      return { 
        success: false, 
        error: err.response?.data || { detail: 'Failed to update profile.' } 
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, loadProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
