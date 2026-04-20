'use client';

import { useState, useEffect, useCallback, useContext, createContext } from 'react';

// Create auth context
const AuthContext = createContext(null);

/**
 * useAuth hook for accessing current user and auth state
 * Usage: const { user, loading, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

/**
 * AuthProvider component to wrap application
 * Manages user session and provides auth context
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      setUser(data);
      return data;
    } catch (err) {
      console.error('Failed to fetch session:', err);
      setUser(null);
      return null;
    }
  }, []);

  // Fetch current session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        await refreshSession();
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [refreshSession]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      // Redirect to login via router in component
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }, []);

  const setAuthUser = useCallback((nextUser) => {
    setUser(nextUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshSession, setAuthUser }}>
      {children}
    </AuthContext.Provider>
  );
}
