// src/screens/ReservationScreen.js
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import useReservation from '../hooks/useReservation';
import { useTheme } from '../context/ThemeContext';

export default function ReservationScreen() {
  const {
    date,
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
    myReservations,
    createReservation,
    cancelReservation,
  } = useReservation();

  const { colors } = useTheme();

  const handleConfirm = () => {
    const result = createReservation();
    if (result.success) {
      Alert.alert('Reserved!', `Table ${result.reservation.tableId} booked for ${result.reservation.timeSlot}.`);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.primary }]}>Reserve a Table</Text>
      <Text style={{ color: colors.subtext, marginBottom: 12 }}>Date: {date.toDateString()}</Text>

      <Text style={[styles.label, { color: colors.text }]}>Party Size</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.stepBtn, { borderColor: colors.border }]}
          onPress={() => setPartySize(Math.max(1, partySize - 1))}
        >
          <Text style={{ fontSize: 18, color: colors.text }}>-</Text>
        </TouchableOpacity>
        <Text style={[styles.partySizeText, { color: colors.text }]}>{partySize}</Text>
        <TouchableOpacity
          style={[styles.stepBtn, { borderColor: colors.border }]}
          onPress={() => setPartySize(Math.min(12, partySize + 1))}
        >
          <Text style={{ fontSize: 18, color: colors.text }}>+</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.label, { color: colors.text }]}>Available Time Slots</Text>
      <View style={styles.chipWrap}>
        {availableSlots.map(({ slot, disabled }) => (
          <TouchableOpacity
            key={slot}
            disabled={disabled}
            style={[
              styles.slotChip,
              { borderColor: colors.border },
              timeSlot === slot && { backgroundColor: colors.primary, borderColor: colors.primary },
              disabled && styles.slotDisabled,
            ]}
            onPress={() => setTimeSlot(slot)}
          >
            <Text
              style={{
                color: disabled ? '#999' : timeSlot === slot ? '#fff' : colors.text,
                fontWeight: 'bold',
              }}
            >
              {slot}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { color: colors.text }]}>Table</Text>
      <View style={styles.chipWrap}>
        {tables
          .filter((t) => t.seats >= partySize)
          .map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.slotChip,
                { borderColor: colors.border },
                tableId === t.id && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => setTableId(t.id)}
            >
              <Text style={{ color: tableId === t.id ? '#fff' : colors.text, fontWeight: 'bold' }}>
                {t.id} ({t.seats} seats)
              </Text>
            </TouchableOpacity>
          ))}
      </View>

      <Text style={[styles.label, { color: colors.text }]}>Contact Name</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        value={contactName}
        onChangeText={setContactName}
        placeholder="Your name"
        placeholderTextColor={colors.subtext}
      />

      <Text style={[styles.label, { color: colors.text }]}>Contact Phone</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        value={contactPhone}
        onChangeText={setContactPhone}
        placeholder="03XX-XXXXXXX"
        placeholderTextColor={colors.subtext}
        keyboardType="phone-pad"
      />

      {formError ? <Text style={styles.error}>{formError}</Text> : null}

      <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: colors.primary }]} onPress={handleConfirm}>
        <Text style={styles.confirmText}>Confirm Reservation</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { color: colors.primary }]}>My Reservations</Text>
      {myReservations.length === 0 ? (
        <Text style={{ color: colors.subtext, marginBottom: 30 }}>No reservations yet.</Text>
      ) : (
        myReservations.map((r) => (
          <View key={r.id} style={[styles.resCard, { backgroundColor: colors.card }]}>
            <Text style={{ color: colors.text, fontWeight: 'bold' }}>
              Table {r.tableId} - {r.date} at {r.timeSlot}
            </Text>
            <Text style={{ color: colors.subtext }}>
              {r.partySize} guests - {r.contactName} - Status: {r.status}
            </Text>
            <TouchableOpacity onPress={() => cancelReservation(r.id)}>
              <Text style={{ color: '#D32F2F', marginTop: 4 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
  label: { fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  stepBtn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6 },
  partySizeText: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 16 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  slotChip: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  slotDisabled: { opacity: 0.4 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12 },
  error: { color: '#D32F2F', marginTop: 14 },
  confirmBtn: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  confirmText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 30, marginBottom: 10 },
  resCard: { padding: 14, borderRadius: 12, marginBottom: 10, elevation: 2 },
});
