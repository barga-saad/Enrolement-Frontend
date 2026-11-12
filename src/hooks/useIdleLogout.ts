/**
 * useIdleLogout - signs the user out after a period without any activity.
 *
 * Activity = mouse, keyboard, scroll, touch or wheel events. The last activity time is shared
 * through localStorage, so several open tabs count as one session: working in one tab keeps the
 * others alive, and they all sign out together.
 *
 * Timeout: VITE_IDLE_TIMEOUT_MS (build-time), default 60 000 ms (1 minute).
 * Disabled in the dev-only UI preview (VITE_DEV_AUTH_BYPASS).
 */

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../utils/authStore';
import { useToast } from '../utils/toastStore';
import { t } from '../utils/langStore';
import { DEV_AUTH_BYPASS } from '../utils/devAuth';

const configuredTimeout = Number(import.meta.env.VITE_IDLE_TIMEOUT_MS);
export const IDLE_TIMEOUT_MS = Number.isFinite(configuredTimeout) && configuredTimeout > 0 ? configuredTimeout : 60_000;

const LAST_ACTIVITY_KEY = 'lastActivityAt';
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'wheel'] as const;
const CHECK_INTERVAL_MS = 1_000;
const WRITE_THROTTLE_MS = 1_000;

const readLastActivity = (): number => {
  try {
    const value = Number(window.localStorage.getItem(LAST_ACTIVITY_KEY));
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
};

const writeLastActivity = (time: number) => {
  try {
    window.localStorage.setItem(LAST_ACTIVITY_KEY, String(time));
  } catch {
    // storage unavailable: the in-memory value below still works for this tab
  }
};

export const useIdleLogout = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const lastActivity = useRef(Date.now());
  const loggingOut = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || DEV_AUTH_BYPASS) return;

    loggingOut.current = false;
    lastActivity.current = Date.now();
    writeLastActivity(lastActivity.current);

    const onActivity = () => {
      const now = Date.now();
      if (now - lastActivity.current < WRITE_THROTTLE_MS) return;
      lastActivity.current = now;
      writeLastActivity(now);
    };

    const check = async () => {
      if (loggingOut.current) return;
      const last = Math.max(lastActivity.current, readLastActivity());
      if (Date.now() - last < IDLE_TIMEOUT_MS) return;

      loggingOut.current = true;
      await logout();
      toast.warning(t(
        'Session fermée automatiquement après une période d’inactivité.',
        'You were signed out automatically after a period of inactivity.'
      ));
      navigate('/login', { replace: true });
    };

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, onActivity, { passive: true }));
    const intervalId = window.setInterval(check, CHECK_INTERVAL_MS);
    // Coming back to a tab after a long time: check right away
    document.addEventListener('visibilitychange', check);

    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, onActivity));
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', check);
    };
  }, [isAuthenticated, logout, navigate]);
};
