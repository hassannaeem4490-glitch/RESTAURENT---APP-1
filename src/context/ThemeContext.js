// src/context/ThemeContext.js
import React, { createContext, useContext, useState } from 'react';

const lightColors = {
  bg: '#FFF5F5',
  card: '#FFFFFF',
  primary: '#8B0000',
  text: '#222222',
  subtext: '#666666',
  border: '#DDDDDD',
};

const darkColors = {
  bg: '#1A1414',
  card: '#2A2020',
  primary: '#FF6B6B',
  text: '#F5F5F5',
  subtext: '#BBBBBB',
  border: '#3A3030',
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => setIsDark((prev) => !prev);
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
