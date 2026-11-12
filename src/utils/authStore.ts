/**
 * Auth Store (Zustand)
 * Global authentication state
 *
 * FLOW:
 *  1. User logs in → backend authenticates via Keycloak + auto-syncs user to DB
 *  2. Admin assigns roles in Users Management
 *  3. User logs in again → roleNames populated → proper access granted
 */

import { create } from 'zustand';
import { AuthState, User } from '../types';
import { storage } from '../utils/helpers';
import { apiService } from '../services/api';
import { logger } from './logger';
import { DEV_AUTH_BYPASS, DEV_PREVIEW_USER } from './devAuth';

interface AuthStore extends AuthState {
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  // Dev-only UI preview: start "signed in" with a fake all-roles profile (see utils/devAuth.ts)
  user: DEV_AUTH_BYPASS ? DEV_PREVIEW_USER : null,
  isAuthenticated: DEV_AUTH_BYPASS,
  isLoading: false,
  error: null,

  setToken: (token: string) => set({ token }),
  setUser: (user: User) => set({ user }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      logger.info('Login attempt started', { username });
      const response = await apiService.login(username, password);
      const loginData = response.data.data;

      const user: User = {
        id: 0,
        username: loginData?.username || username,
        email: loginData?.email || '',
        firstName: loginData?.firstName || '',
        lastName: loginData?.lastName || '',
        isActive: true,
        roleNames: loginData?.roleNames || [],
        createdAt: '',
        updatedAt: '',
        deletedAt: null,
        isDeleted: false,
      };

      if (!loginData || !loginData.token) {
        throw new Error('No token received from server');
      }

      set({
        token: loginData.token,
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      storage.set('authToken', loginData.token);
      if (loginData.refreshToken) storage.set('refreshToken', loginData.refreshToken);
      storage.set('user', user);
      logger.info('Login successful', {
        username,
        roleCount: user.roleNames.length,
      });

      if (user.roleNames.length === 0) {
        logger.warn('User has no assigned roles after login', { username });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      set({ error: errorMessage, isLoading: false, isAuthenticated: false });
      logger.error('Login failed', { username, errorMessage }, error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await apiService.logout();
      logger.info('Logout completed');
    } catch (_) {
      // non-critical
      logger.warn('Logout endpoint failed, clearing local session anyway');
    } finally {
      set({ token: null, user: null, isAuthenticated: false, error: null });
      storage.remove('authToken');
      storage.remove('user');
    }
  },

  hydrate: () => {
    if (DEV_AUTH_BYPASS) {
      set({ token: null, user: DEV_PREVIEW_USER, isAuthenticated: true });
      return;
    }
    const token = storage.get('authToken');
    const user = storage.get('user');
    if (token && user) {
      set({ token, user, isAuthenticated: true });
      logger.debug('Auth state hydrated from storage', {
        username: user.username,
        roleCount: user.roleNames?.length || 0,
      });
    }
  },

  refreshUser: async () => {
    if (DEV_AUTH_BYPASS) return;
    const token = storage.get('authToken');
    if (!token) return;
    try {
      const response = await apiService.getMe(token);
      const data = response.data.data;
      if (!data) return;
      const user: User = {
        id: 0,
        username: data.username || '',
        email: data.email || '',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        isActive: true,
        roleNames: data.roleNames || [],
        createdAt: '',
        updatedAt: '',
        deletedAt: null,
        isDeleted: false,
      };
      set({ user });
      storage.set('user', user);
      logger.debug('User profile refreshed', {
        username: user.username,
        roleCount: user.roleNames.length,
      });
    } catch (_) {
      // silent — stale cache is better than breaking the app
      logger.warn('Failed to refresh current user profile from backend');
    }
  },
}));
