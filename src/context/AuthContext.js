// src/context/AuthContext.js
import React, { createContext, useContext, useState } from 'react';
import { users, findUserByCredentials, emailExists } from '../data/users';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Logged-in user object, or null when signed out.
  const [user, setUser] = useState(null);

  // Simulates a network call (see Q3): resolves/rejects after ~1s.
  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const found = findUserByCredentials(email, password);
        if (found) {
          const { password: _pw, ...safeUser } = found;
          setUser(safeUser);
          resolve(safeUser);
        } else {
          reject(new Error('Email or password is incorrect.'));
        }
      }, 1000);
    });
  };

  const signup = ({ fullName, email, password, role }) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (emailExists(email)) {
          reject(new Error('An account with this email already exists.'));
          return;
        }
        const newUser = {
          id: `u${users.length + 1}`,
          fullName,
          email,
          password,
          role,
        };
        users.push(newUser); // mock "insert" - lives only for this app session
        const { password: _pw, ...safeUser } = newUser;
        setUser(safeUser);
        resolve(safeUser);
      }, 1000);
    });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom consumer hook (Q6 requirement) - throws if used outside the provider.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
