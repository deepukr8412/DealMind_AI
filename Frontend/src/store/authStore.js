// ===========================================
// Auth Store (Zustand)
// Manages user authentication state
// ===========================================
import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  // Register
  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/register', data);
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, loading: false });
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // Login
  login: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/login', data);
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, loading: false });
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // Set token (for OAuth callback)
  setToken: async (token) => {
    localStorage.setItem('token', token);
    set({ token, isAuthenticated: true });
    // Fetch user data
    try {
      const res = await api.get('/auth/me');
      const user = res.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
  },

  // Update profile
  updateProfile: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put('/auth/profile', data);
      const user = res.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, loading: false });
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Update failed';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // Upload avatar
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await api.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const user = res.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Upload failed');
    }
  },

  // Fetch user data
  fetchUser: async () => {
    try {
      const res = await api.get('/auth/me');
      const user = res.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
    } catch (err) {
      console.error('Fetch user error:', err);
    }
  },

  // Forgot Password
  forgotPassword: async (email) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/forgot-password', { email });
      set({ loading: false });
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send reset email';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // Reset Password
  resetPassword: async (token, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post(`/auth/reset-password/${token}`, { password });
      set({ loading: false });
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Password reset failed';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
