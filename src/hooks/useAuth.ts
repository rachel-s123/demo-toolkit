import { useState, useEffect, useCallback } from 'react';
import supabase from '../services/supabaseClient';

interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  session: any;
}

export const useAuth = (): UseAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setSession(null);
    // Clear all Supabase-related storage
    localStorage.removeItem('sb-access-token');
    localStorage.removeItem('sb-refresh-token');
    sessionStorage.removeItem('sb-access-token');
    sessionStorage.removeItem('sb-refresh-token');
    // Clear any other Supabase storage keys
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-')) {
        localStorage.removeItem(key);
      }
    });
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
    // Clear heartbeat
    sessionStorage.removeItem('auth-heartbeat');
    supabase.auth.signOut();
  }, []);

  // Handle authentication state changes
  useEffect(() => {
    // Check for stale sessions on page load
    const checkStaleSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          logout();
          return;
        }
        if (session) {
          // Check if session is expired
          const now = Math.floor(Date.now() / 1000);
          if (session.expires_at && session.expires_at < now) {
            logout();
            return;
          }
        }
        setIsAuthenticated(!!session);
        setSession(session);
        setIsLoading(false);
      } catch (error) {
        logout();
        setIsLoading(false);
      }
    };
    checkStaleSession();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      switch (event) {
        case 'SIGNED_IN':
        case 'USER_UPDATED':
        case 'TOKEN_REFRESHED':
        case 'MFA_CHALLENGE_VERIFIED':
          setIsAuthenticated(!!session);
          setSession(session);
          break;
        case 'SIGNED_OUT':
          setIsAuthenticated(false);
          setSession(null);
          break;
        default:
          setIsAuthenticated(!!session);
          setSession(session);
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [logout]);

  // Session timeout handling
  useEffect(() => {
    if (!isAuthenticated) return;
    // Check session every 5 minutes
    const sessionCheckInterval = setInterval(async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          logout();
          return;
        }
        // Check if session is expired
        const now = Math.floor(Date.now() / 1000);
        if (session.expires_at && session.expires_at < now) {
          logout();
          return;
        }
        // Refresh session if it's close to expiring (within 1 hour)
        if (session.expires_at && session.expires_at - now < 3600) {
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            logout();
          }
        }
      } catch (error) {
        logout();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    // Heartbeat mechanism to detect if page was closed and reopened
    const heartbeatInterval = setInterval(() => {
      const lastHeartbeat = sessionStorage.getItem('auth-heartbeat');
      const now = Date.now().toString();
      if (lastHeartbeat) {
        const timeDiff = Date.now() - parseInt(lastHeartbeat);
        // --- RELAXED: Increase timeout to 30 minutes (was 5) ---
        if (timeDiff > 30 * 60 * 1000) { // 30 minutes
          logout();
          return;
        }
      }
      sessionStorage.setItem('auth-heartbeat', now);
    }, 30 * 1000); // Check every 30 seconds

    return () => {
      clearInterval(sessionCheckInterval);
      clearInterval(heartbeatInterval);
    };
  }, [isAuthenticated, logout]);

  return {
    isAuthenticated,
    isLoading,
    logout,
    session,
  };
}; 