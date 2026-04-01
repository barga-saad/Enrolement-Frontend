/**
 * Redux: Auth Store (using Zustand)
 * Global state management for authentication
 */

import { create } from 'zustand';
import { AuthState, User } from '../types';
import { storage } from '../utils/helpers';
import { apiService } from '../services/api';

interface AuthStore extends AuthState {
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setToken: (token: string) => set({ token }),
  setUser: (user: User) => set({ user }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.login(username, password);
      const { token, user } = response.data;

      // Store in Zustand
      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      // Persist to localStorage
      storage.set('authToken', token);
      storage.set('user', user);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        error: null,
      });

      // Clear storage
      storage.remove('authToken');
      storage.remove('user');
    }
  },

  hydrate: () => {
    const token = storage.get('authToken');
    const user = storage.get('user');

    if (token && user) {
      set({
        token,
        user,
        isAuthenticated: true,
      });
    }
  },
}));
