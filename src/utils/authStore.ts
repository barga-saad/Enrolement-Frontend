/**
 * Redux: Auth Store (using Zustand)
 * Global state management for authentication
 */

import { create } from 'zustand';
import { AuthState, User } from '../types';
import { storage } from '../utils/helpers';
import { apiService } from '../services/api';

/**
 * Helper function to decode JWT token and extract claims
 */
function decodeJWT(token: string): Record<string, any> {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return {};
  }
}

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
      console.log('[Auth] Attempting login for user:', username);
      const response = await apiService.login(username, password);
      console.log('[Auth] Login response received:', response);
      
      // Extract from ApiResponse wrapper: response.data.data contains LoginResponse
      const loginData = response.data.data;
      console.log('[Auth] Login data extracted:', loginData);
      
      if (!loginData || !loginData.token) {
        throw new Error('No token received from server');
      }
      
      const token = loginData.token;
      console.log('[Auth] Token extracted:', token.substring(0, 50) + '...');

      // Decode JWT to extract user info from claims
      const decodedUser = decodeJWT(token);
      console.log('[Auth] JWT decoded:', decodedUser);
      
      const user: User = {
        id: 0, // Not in JWT claims
        username: decodedUser.preferred_username || username,
        email: decodedUser.email || '',
        firstName: decodedUser.given_name || '',
        lastName: decodedUser.family_name || '',
        isActive: true,
        roleNames: decodedUser.roles || [],
        createdAt: '',
        updatedAt: '',
        deletedAt: null,
        isDeleted: false,
      };
      console.log('[Auth] User object created:', user);

      // Store in Zustand
      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      console.log('[Auth] State updated - isAuthenticated should be true now');

      // Persist to localStorage
      storage.set('authToken', token);
      storage.set('user', user);
      console.log('[Auth] Data persisted to localStorage');
      
    } catch (error: any) {
      console.error('[Auth] Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      console.error('[Auth] Error message:', errorMessage);
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
