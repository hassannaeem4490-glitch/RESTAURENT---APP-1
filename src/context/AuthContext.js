// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient, { AUTH_STORAGE_KEY } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Restore stored session on app startup
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (stored && isMounted) {
          const parsed = JSON.parse(stored);
          setUser(parsed.user);
          setToken(parsed.token);
        }
      } catch (err) {
        console.error('Failed to restore auth from AsyncStorage:', err);
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    try {
      const data = await apiClient('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      setUser(data.user);
      setToken(data.token);

      await AsyncStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ user: data.user, token: data.token })
      );

      return data.user;
    } catch (error) {
      console.error('Login error:', error.message);
      throw error;
    }
  };

  const signup = async ({ fullName, email, password, role }) => {
    try {
      const data = await apiClient('/api/auth/register', {
        method: 'POST',
        body: { fullName, email, password, role },
      });

      setUser(data.user);
      setToken(data.token);

      await AsyncStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ user: data.user, token: data.token })
      );

      return data.user;
    } catch (error) {
      console.error('Signup error:', error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isInitializing,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
