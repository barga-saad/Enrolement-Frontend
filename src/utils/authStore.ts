/**
 * Auth Store (Zustand)
 * Global authentication state
 *
 * FLOW:
 *  1. User logs in → backend authenticates via Keycloak + auto-syncs user to DB
 *  2. If requiresPasswordChange=true → redirect to /change-password
 *  3. Admin assigns roles in Users Management
 *  4. User logs in again → roleNames populated → proper access granted
 */

import { create } from 'zustand';
import { AuthState, User } from '../types';
import { storage } from '../utils/helpers';
import { apiService } from '../services/api';
import { logger } from './logger';

interface AuthStore extends AuthState {
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => void;
  refreshUser: () => Promise<void>;
  changePassword: (username: string, newPassword: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  requiresPasswordChange: false,

  setToken: (token: string) => set({ token }),
  setUser: (user: User) => set({ user }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null, requiresPasswordChange: false });
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

      const requiresPasswordChange = loginData?.requiresPasswordChange === true;

      // Temp password user: Keycloak won't issue a token, but we still
      // need to redirect to /change-password
      if (requiresPasswordChange && !loginData?.token) {
        logger.warn('Temporary password flow detected', { username });
        set({
          token: null,
          user,
          isAuthenticated: true,
          requiresPasswordChange: true,
          isLoading: false,
        });
        storage.set('user', user);
        storage.set('requiresPasswordChange', true);
        return;
      }

      if (!loginData || !loginData.token) {
        throw new Error('No token received from server');
      }

      set({
        token: loginData.token,
        user,
        isAuthenticated: true,
        requiresPasswordChange,
        isLoading: false,
      });

      storage.set('authToken', loginData.token);
      storage.set('user', user);
      storage.set('requiresPasswordChange', requiresPasswordChange);

      logger.info('Login successful', {
        username,
        roleCount: user.roleNames.length,
        requiresPasswordChange,
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

  changePassword: async (username: string, newPassword: string) => {
    set({ isLoading: true, error: null });
    try {
      logger.info('Password change started', { username });
      await apiService.changePassword(username, newPassword);
      // Auto-login to get the proper token after password change
      const response = await apiService.login(username, newPassword);
      const loginData = response.data.data;
      
      if (!loginData || !loginData.token) {
        throw new Error('Verification failed after password change. Please log in manually.');
      }

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

      set({ 
        token: loginData.token, 
        user, 
        isAuthenticated: true, 
        requiresPasswordChange: false, 
        isLoading: false 
      });

      storage.set('authToken', loginData.token);
      storage.set('user', user);
      storage.set('requiresPasswordChange', false);

      logger.info('Password changed successfully', { username });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update access credentials';
      set({ error: errorMessage, isLoading: false });
      logger.error('Password change failed', { username, errorMessage }, error);
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
      set({ token: null, user: null, isAuthenticated: false, error: null, requiresPasswordChange: false });
      storage.remove('authToken');
      storage.remove('user');
      storage.remove('requiresPasswordChange');
    }
  },

  hydrate: () => {
    const token = storage.get('authToken');
    const user = storage.get('user');
    const requiresPasswordChange = storage.get('requiresPasswordChange') === true;

    if (token && user) {
      set({ token, user, isAuthenticated: true, requiresPasswordChange });
      logger.debug('Auth state hydrated from storage', {
        username: user.username,
        roleCount: user.roleNames?.length || 0,
      });
    }
  },

  refreshUser: async () => {
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
