// src/context/ReservationsContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@restaurant_app/reservations';

const ReservationsContext = createContext(null);

export function ReservationsProvider({ children }) {
  const [reservations, setReservations] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored && isMounted) {
          setReservations(JSON.parse(stored));
        }
      } catch (e) {
        // ignore
      } finally {
        if (isMounted) setIsLoaded(true);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reservations)).catch(() => {});
  }, [reservations, isLoaded]);

  const addReservation = (reservation) => {
    const newReservation = {
      id: `RES-${Date.now()}`,
      status: 'Pending',
      ...reservation,
    };
    setReservations((prev) => [newReservation, ...prev]);
    return newReservation;
  };

  const cancelReservation = (id) => {
    setReservations((prev) => prev.filter((r) => r.id !== id));
  };

  const setReservationStatus = (id, status) => {
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  return (
    <ReservationsContext.Provider
      value={{ reservations, isLoaded, addReservation, cancelReservation, setReservationStatus }}
    >
      {children}
    </ReservationsContext.Provider>
  );
}

export function useReservationsContext() {
  const ctx = useContext(ReservationsContext);
  if (!ctx) {
    throw new Error('useReservationsContext must be used within a ReservationsProvider');
  }
  return ctx;
}
