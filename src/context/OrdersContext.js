// src/context/OrdersContext.js
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import apiClient from '../api/client';
import { useAuth } from './AuthContext';

const OrdersContext = createContext(null);

export function OrdersProvider({ children }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const endpoint = user.role === 'manager' ? '/api/orders' : '/api/orders/my';
      const data = await apiClient(endpoint);
      const normalized = (data || []).map((o) => ({
        ...o,
        id: o._id || o.id,
      }));
      setOrders(normalized);
      return normalized;
    } catch (err) {
      console.error('Error fetching orders:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const placeOrder = async (orderData) => {
    try {
      const created = await apiClient('/api/orders', {
        method: 'POST',
        body: orderData,
      });
      const normalized = { ...created, id: created._id || created.id };
      setOrders((prev) => [normalized, ...prev]);
      return normalized;
    } catch (err) {
      console.error('Error placing order on server:', err.message);
      throw err;
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const updated = await apiClient(`/api/orders/${id}/status`, {
        method: 'PATCH',
        body: { status },
      });
      const normalized = { ...updated, id: updated._id || updated.id };
      setOrders((prev) => prev.map((o) => (o.id === id ? normalized : o)));
      return normalized;
    } catch (err) {
      console.error('Error updating order status:', err.message);
      throw err;
    }
  };

  return (
    <OrdersContext.Provider
      value={{
        orders,
        loading,
        error,
        fetchOrders,
        placeOrder,
        updateStatus,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return ctx;
}
