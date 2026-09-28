// src/context/MenuContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initialMenu } from '../data/menu';

const STORAGE_KEY = '@restaurant_app/menu';

const MenuContext = createContext(null);

export function MenuProvider({ children }) {
  const [menuItems, setMenuItems] = useState(initialMenu);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load any manager edits saved from a previous session.
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored && isMounted) {
          setMenuItems(JSON.parse(stored));
        }
      } catch (e) {
        // ignore - fall back to initialMenu
      } finally {
        if (isMounted) setIsLoaded(true);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Persist whenever menuItems changes (after initial load).
  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(menuItems)).catch(() => {});
  }, [menuItems, isLoaded]);

  const editPrice = (id, newPrice) => {
    setMenuItems((prev) => prev.map((m) => (m.id === id ? { ...m, price: newPrice } : m)));
  };

  const toggleAvailability = (id) => {
    setMenuItems((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isAvailable: !m.isAvailable } : m))
    );
  };

  const addItem = (item) => {
    setMenuItems((prev) => [...prev, { ...item, id: Date.now() }]);
  };

  return (
    <MenuContext.Provider value={{ menuItems, isLoaded, editPrice, toggleAvailability, addItem }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return ctx;
}
