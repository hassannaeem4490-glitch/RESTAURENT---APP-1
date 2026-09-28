// src/hooks/useReservation.js
import { useMemo, useState } from 'react';
import { mockTables, TIME_SLOTS } from '../data/tables';
import { useReservationsContext } from '../context/ReservationsContext';

const PK_PHONE_REGEX = /^03\d{2}-\d{7}$/;

export default function useReservation() {
  const { reservations, addReservation, cancelReservation } = useReservationsContext();

  const [date, setDate] = useState(new Date());
  const [timeSlot, setTimeSlot] = useState(null);
  const [partySize, setPartySize] = useState(2);
  const [tableId, setTableId] = useState(null);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [formError, setFormError] = useState('');

  // A table is free at a slot if no active reservation occupies it that day+time.
  const isTableFreeAt = (table, day, slot) => {
    const dayStr = day.toDateString();
    return !reservations.some(
      (r) =>
        r.tableId === table.id &&
        r.status !== 'Cancelled' &&
        r.date === dayStr &&
        r.timeSlot === slot
    );
  };

  // For the currently selected date/time, which slots have at least one free table
  // big enough for the current party size.
  const availableSlots = useMemo(() => {
    return TIME_SLOTS.map((slot) => {
      const hasFreeTable = mockTables.some(
        (t) => t.seats >= partySize && isTableFreeAt(t, date, slot)
      );
      return { slot, disabled: !hasFreeTable };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, partySize, reservations]);

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

  const createReservation = () => {
    const error = validate();
    if (error) {
      setFormError(error);
      return { success: false, error };
    }
    setFormError('');
    const reservation = addReservation({
      date: date.toDateString(),
      timeSlot,
      partySize,
      tableId,
      contactName,
      contactPhone,
    });
    // reset form
    setTimeSlot(null);
    setTableId(null);
    setContactName('');
    setContactPhone('');
    return { success: true, reservation };
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
    tables: mockTables,
    myReservations: reservations,
    createReservation,
    cancelReservation,
  };
}
