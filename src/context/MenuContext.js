// src/context/MenuContext.js
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import apiClient from '../api/client';

const MenuContext = createContext(null);

export function MenuProvider({ children }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMenu = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      let queryStr = '';
      const queryParams = new URLSearchParams();
      if (params.category) queryParams.append('category', params.category);
      if (params.search) queryParams.append('search', params.search);
      const qs = queryParams.toString();
      if (qs) queryStr = `?${qs}`;

      const data = await apiClient(`/api/menu${queryStr}`);
      // normalize _id to id so components work seamlessly
      const normalized = (data || []).map((item) => ({
        ...item,
        id: item._id || item.id,
      }));
      setMenuItems(normalized);
      return normalized;
    } catch (err) {
      console.error('Error fetching menu from server:', err.message);
      setError(err.message || 'Failed to load menu');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu().catch(() => {});
  }, [fetchMenu]);

  const editPrice = async (id, newPrice) => {
    try {
      await apiClient(`/api/menu/${id}`, {
        method: 'PUT',
        body: { price: Number(newPrice) },
      });
      await fetchMenu();
    } catch (err) {
      console.error('Failed to update price:', err.message);
      throw err;
    }
  };

  const toggleAvailability = async (id) => {
    const item = menuItems.find((m) => m.id === id);
    if (!item) return;
    try {
      await apiClient(`/api/menu/${id}`, {
        method: 'PUT',
        body: { isAvailable: !item.isAvailable },
      });
      await fetchMenu();
    } catch (err) {
      console.error('Failed to toggle availability:', err.message);
      throw err;
    }
  };

  const addItem = async (itemData) => {
    try {
      await apiClient('/api/menu', {
        method: 'POST',
        body: itemData,
      });
      await fetchMenu();
    } catch (err) {
      console.error('Failed to add item:', err.message);
      throw err;
    }
  };

  const deleteItem = async (id) => {
    try {
      await apiClient(`/api/menu/${id}`, {
        method: 'DELETE',
      });
      await fetchMenu();
    } catch (err) {
      console.error('Failed to delete item:', err.message);
      throw err;
    }
  };

  return (
    <MenuContext.Provider
      value={{
        menuItems,
        loading,
        error,
        fetchMenu,
        editPrice,
        toggleAvailability,
        addItem,
        deleteItem,
      }}
    >
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
