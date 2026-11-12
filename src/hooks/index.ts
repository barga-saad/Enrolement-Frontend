/**
 * Custom React Hooks
 * Reusable logic hooks for components
 */

import { useEffect, useState } from 'react';
import { useAuthStore } from '../utils/authStore';

/**
 * useAuth - Access authentication state and methods
 */
export const useAuth = () => {
  const auth = useAuthStore();
  
  useEffect(() => {
    // Hydrate from localStorage immediately, then refresh roles from backend
    auth.hydrate();
    auth.refreshUser();
  }, []);

  return {
    token: auth.token,
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    login: auth.login,
    logout: auth.logout,
    refreshUser: auth.refreshUser,
    setError: auth.setError,
  };
};

/**
 * usePrevious - Get previous value of a prop/state
 */
export const usePrevious = <T,>(value: T): T | undefined => {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

/**
 * useWindowSize - Get window dimensions
 */
export const useWindowSize = () => {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
};

/**
 * useIsMobile - Check if viewport is mobile
 */
export const useIsMobile = () => {
  const size = useWindowSize();
  const [isMobile, setIsMobile] = useState(size.width < 768);

  useEffect(() => {
    setIsMobile(size.width < 768);
  }, [size.width]);

  return isMobile;
};

import { useRef } from 'react';
