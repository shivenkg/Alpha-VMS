import { useState, useEffect, useRef, useCallback } from 'react';

const DEFAULT_INACTIVITY_LIMIT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_THRESHOLD_MS = 60 * 1000; // Warn 1 minute before logout
const ACTIVITY_STORAGE_KEY = 'vms_enterprise_last_active_time';
const LOGOUT_REASON_STORAGE_KEY = 'vms_inactivity_logout_notice';

interface UseInactivityTimeoutOptions {
  timeoutMs?: number;
  warningThresholdMs?: number;
  enabled?: boolean;
  onLogout: () => void;
  onWarning?: (remainingSeconds: number) => void;
}

export interface InactivityState {
  isWarning: boolean;
  remainingSeconds: number;
  resetTimer: () => void;
}

/**
 * Enterprise Inactivity Monitor Hook
 * Automatically monitors user activity (mouse, keyboard, touch, scroll)
 * and triggers logout after 30 minutes of idle time to adhere to enterprise security mandates.
 * Synchronizes across multiple browser tabs via StorageEvent.
 */
export const useInactivityTimeout = ({
  timeoutMs = DEFAULT_INACTIVITY_LIMIT_MS,
  warningThresholdMs = WARNING_THRESHOLD_MS,
  enabled = true,
  onLogout,
  onWarning,
}: UseInactivityTimeoutOptions): InactivityState => {
  const [isWarning, setIsWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(Math.floor(timeoutMs / 1000));
  const lastActiveRef = useRef<number>(Date.now());
  const lastThrottleRef = useRef<number>(0);
  const onLogoutRef = useRef(onLogout);
  const onWarningRef = useRef(onWarning);

  // Keep callback refs updated to avoid re-triggering effects
  useEffect(() => {
    onLogoutRef.current = onLogout;
  }, [onLogout]);

  useEffect(() => {
    onWarningRef.current = onWarning;
  }, [onWarning]);

  // Reset activity function
  const resetTimer = useCallback(() => {
    const now = Date.now();
    lastActiveRef.current = now;
    setIsWarning(false);
    setRemainingSeconds(Math.floor(timeoutMs / 1000));
    try {
      localStorage.setItem(ACTIVITY_STORAGE_KEY, now.toString());
    } catch {
      // Storage unavailable or disabled
    }
  }, [timeoutMs]);

  // Listen for user activity events with 1s throttling
  useEffect(() => {
    if (!enabled) return;

    // Initialize initial activity timestamp
    resetTimer();

    const handleUserActivity = () => {
      const now = Date.now();
      // Throttle event updates to at most once per second for high performance
      if (now - lastThrottleRef.current > 1000) {
        lastThrottleRef.current = now;
        lastActiveRef.current = now;
        if (isWarning) {
          setIsWarning(false);
        }
        try {
          localStorage.setItem(ACTIVITY_STORAGE_KEY, now.toString());
        } catch {
          // Ignore
        }
      }
    };

    // Cross-tab synchronization: if user is active in another tab, reset here too
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ACTIVITY_STORAGE_KEY && e.newValue) {
        const remoteTimestamp = parseInt(e.newValue, 10);
        if (!isNaN(remoteTimestamp) && remoteTimestamp > lastActiveRef.current) {
          lastActiveRef.current = remoteTimestamp;
          setIsWarning(false);
        }
      }
    };

    const monitoredEvents = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
      'click',
      'wheel',
    ] as const;

    monitoredEvents.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });
    window.addEventListener('storage', handleStorageChange);

    return () => {
      monitoredEvents.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [enabled, resetTimer, isWarning]);

  // Periodic heartbeat checker (runs every 2 seconds)
  useEffect(() => {
    if (!enabled) return;

    const checkInterval = setInterval(() => {
      const now = Date.now();
      // Also check localStorage in case another tab updated it
      let latestActive = lastActiveRef.current;
      try {
        const stored = localStorage.getItem(ACTIVITY_STORAGE_KEY);
        if (stored) {
          const parsed = parseInt(stored, 10);
          if (!isNaN(parsed) && parsed > latestActive) {
            latestActive = parsed;
            lastActiveRef.current = parsed;
          }
        }
      } catch {
        // Ignore
      }

      const elapsed = now - latestActive;
      const remainingMs = timeoutMs - elapsed;
      const remainingSec = Math.max(0, Math.floor(remainingMs / 1000));
      setRemainingSeconds(remainingSec);

      // Check if inactivity limit exceeded
      if (elapsed >= timeoutMs) {
        try {
          sessionStorage.setItem(
            LOGOUT_REASON_STORAGE_KEY,
            'You have been automatically logged out due to 30 minutes of inactivity to protect enterprise security.'
          );
        } catch {
          // Ignore
        }
        setIsWarning(false);
        clearInterval(checkInterval);
        onLogoutRef.current();
        return;
      }

      // Check if approaching timeout (within warning threshold)
      if (remainingMs <= warningThresholdMs && remainingMs > 0) {
        setIsWarning(true);
        if (onWarningRef.current) {
          onWarningRef.current(remainingSec);
        }
      } else {
        setIsWarning(false);
      }
    }, 2000);

    return () => clearInterval(checkInterval);
  }, [enabled, timeoutMs, warningThresholdMs]);

  return {
    isWarning,
    remainingSeconds,
    resetTimer,
  };
};

export const getInactivityLogoutNotice = (): string | null => {
  try {
    const notice = sessionStorage.getItem(LOGOUT_REASON_STORAGE_KEY);
    if (notice) {
      sessionStorage.removeItem(LOGOUT_REASON_STORAGE_KEY);
      return notice;
    }
  } catch {
    // Ignore
  }
  return null;
};
