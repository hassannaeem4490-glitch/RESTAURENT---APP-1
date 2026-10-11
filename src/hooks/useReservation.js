// src/hooks/useReservation.js
import { useEffect, useMemo, useState, useCallback } from 'react';
import apiClient from '../api/client';
import { TIME_SLOTS } from '../data/tables';

const PK_PHONE_REGEX = /^03\d{2}-\d{7}$/;

export default function useReservation() {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);

  const [date, setDate] = useState(new Date());
  const [timeSlot, setTimeSlot] = useState(null);
  const [partySize, setPartySize] = useState(2);
  const [tableId, setTableId] = useState(null);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [formError, setFormError] = useState('');

  // Fetch tables and customer reservations from server
  const fetchReservationData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedTables, fetchedReservations] = await Promise.allSettled([
        apiClient('/api/reservations/tables'),
        apiClient('/api/reservations/my'),
      ]);

      if (fetchedTables.status === 'fulfilled' && Array.isArray(fetchedTables.value)) {
        setTables(
          fetchedTables.value.map((t) => ({
            id: t.tableId || t.id,
            seats: t.seats,
          }))
        );
      }

      if (fetchedReservations.status === 'fulfilled' && Array.isArray(fetchedReservations.value)) {
        setReservations(
          fetchedReservations.value.map((r) => ({
            ...r,
            id: r._id || r.id,
          }))
        );
      }
    } catch (err) {
      console.warn('Error fetching reservation data:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservationData();
  }, [fetchReservationData]);

  // A table is free at a slot if no active reservation occupies it that day+time.
  const isTableFreeAt = (table, day, slot) => {
    const dayStr = day.toDateString();
    return !reservations.some(
      (r) =>
        r.tableId === table.id &&
        r.status !== 'Cancelled' &&
        r.status !== 'Declined' &&
        r.date === dayStr &&
        r.timeSlot === slot
    );
  };

  const availableSlots = useMemo(() => {
    return TIME_SLOTS.map((slot) => {
      const hasFreeTable = tables.some(
        (t) => t.seats >= partySize && isTableFreeAt(t, date, slot)
      );
      return { slot, disabled: !hasFreeTable };
    });
  }, [date, partySize, reservations, tables]);

  const validate = () => {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    if (date < new Date(now.toDateString())) {
      return 'Date cannot be in the past.';
    }
    if (partySize < 1 || partySize > 12) {
      return 'Party size must be between 1 and 12.';
    }
    if (!PK_PHONE_REGEX.test(contactPhone)) {
      return 'Phone must match the format 03XX-XXXXXXX.';
    }
    if (!timeSlot) {
      return 'Please select a time slot.';
    }
    const [h, m] = timeSlot.split(':').map(Number);
    const slotDateTime = new Date(date);
    slotDateTime.setHours(h, m, 0, 0);
    if (slotDateTime < oneHourFromNow) {
      return 'Booking must be at least one hour ahead.';
    }
    if (!tableId) {
      return 'Please select a table.';
    }
    return '';
  };

  const createReservation = async () => {
    const error = validate();
    if (error) {
      setFormError(error);
      return { success: false, error };
    }
    setFormError('');

    try {
      const newBooking = await apiClient('/api/reservations', {
        method: 'POST',
        body: {
          date: date.toDateString(),
          timeSlot,
          partySize,
          tableId,
          contactName: contactName.trim(),
          contactPhone: contactPhone.trim(),
        },
      });

      const normalized = { ...newBooking, id: newBooking._id || newBooking.id };
      setReservations((prev) => [normalized, ...prev]);

      // Reset form
      setTimeSlot(null);
      setTableId(null);
      setContactName('');
      setContactPhone('');

      return { success: true, reservation: normalized };
    } catch (err) {
      setFormError(err.message || 'Failed to book reservation');
      return { success: false, error: err.message };
    }
  };

  const cancelReservation = async (id) => {
    try {
      await apiClient(`/api/reservations/${id}/cancel`, {
        method: 'PATCH',
      });
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'Cancelled' } : r))
      );
    } catch (err) {
      console.error('Cancel error:', err.message);
    }
  };

  return {
    date,
    setDate,
    timeSlot,
    setTimeSlot,
    partySize,
    setPartySize,
    tableId,
    setTableId,
    contactName,
    setContactName,
    contactPhone,
    setContactPhone,
    formError,
    availableSlots,
    tables,
    myReservations: reservations,
    loading,
    createReservation,
    cancelReservation,
    refetch: fetchReservationData,
  };
}
