// src/screens/ManagerDashboardScreen.js
import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { useOrders } from '../context/OrdersContext';
import { useReservationsContext } from '../context/ReservationsContext';
import { useMenu } from '../context/MenuContext';
import { useTheme } from '../context/ThemeContext';
import { ORDER_STATUSES } from '../reducers/ordersReducer';

const TABS = ['Orders', 'Reservations', 'Menu'];

export default function ManagerDashboardScreen() {
  const [activeTab, setActiveTab] = useState('Orders');
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.primary }]}>Manager Dashboard</Text>

      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabBtn,
              { borderColor: colors.primary },
              activeTab === tab && { backgroundColor: colors.primary },
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={{ color: activeTab === tab ? '#fff' : colors.primary, fontWeight: 'bold' }}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'Orders' && <OrdersTab />}
      {activeTab === 'Reservations' && <ReservationsTab />}
      {activeTab === 'Menu' && <MenuTab />}
    </View>
  );
}

function OrdersTab() {
  const { orders, updateStatus } = useOrders();
  const { colors } = useTheme();

  if (orders.length === 0) {
    return <Text style={{ color: colors.subtext, marginTop: 20 }}>No orders yet.</Text>;
  }

  return (
    <ScrollView>
      {orders.map((order) => (
        <View key={order.id} style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={{ color: colors.text, fontWeight: 'bold' }}>
            {order.id.slice(-6)} - {order.orderType === 'Dine-in' ? `Table ${order.table}` : `Pickup ${order.pickupTime}`}
          </Text>
          <Text style={{ color: colors.subtext, marginBottom: 6 }}>
            {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
          </Text>
          <Text style={{ color: colors.primary, fontWeight: 'bold', marginBottom: 8 }}>
            ${order.total.toFixed(2)} - {order.status}
          </Text>
          <View style={styles.statusRow}>
            {ORDER_STATUSES.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusChip,
                  { borderColor: colors.border },
                  order.status === status && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => updateStatus(order.id, status)}
              >
                <Text style={{ fontSize: 10, color: order.status === status ? '#fff' : colors.text }}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function ReservationsTab() {
  const { reservations, setReservationStatus } = useReservationsContext();
  const { colors } = useTheme();

  if (reservations.length === 0) {
    return <Text style={{ color: colors.subtext, marginTop: 20 }}>No reservations yet.</Text>;
  }

  return (
    <ScrollView>
      {reservations.map((r) => (
        <View key={r.id} style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={{ color: colors.text, fontWeight: 'bold' }}>
            Table {r.tableId} - {r.date} at {r.timeSlot}
          </Text>
          <Text style={{ color: colors.subtext, marginBottom: 8 }}>
            {r.partySize} guests - {r.contactName} ({r.contactPhone}) - {r.status}
          </Text>
          <View style={styles.rowGap}>
            <TouchableOpacity
              style={[styles.smallBtn, { backgroundColor: '#2E7D32' }]}
              onPress={() => setReservationStatus(r.id, 'Confirmed')}
            >
              <Text style={styles.smallBtnText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.smallBtn, { backgroundColor: '#D32F2F' }]}
              onPress={() => setReservationStatus(r.id, 'Declined')}
            >
              <Text style={styles.smallBtnText}>Decline</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function MenuTab() {
  const { menuItems, editPrice, toggleAvailability } = useMenu();
  const { colors } = useTheme();
  const [priceDrafts, setPriceDrafts] = useState({});

  const savePrice = (id) => {
    const draft = priceDrafts[id];
    const parsed = parseFloat(draft);
    if (!isNaN(parsed) && parsed > 0) {
      editPrice(id, parsed);
    }
  };

  return (
    <ScrollView>
      {menuItems.map((item) => (
        <View key={item.id} style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={{ color: colors.text, fontWeight: 'bold' }}>
            {item.emoji} {item.name}
          </Text>
          <View style={styles.rowBetween}>
            <TextInput
              style={[styles.priceInput, { borderColor: colors.border, color: colors.text }]}
              defaultValue={item.price.toString()}
              keyboardType="decimal-pad"
              onChangeText={(t) => setPriceDrafts((prev) => ({ ...prev, [item.id]: t }))}
            />
            <TouchableOpacity
              style={[styles.smallBtn, { backgroundColor: colors.primary }]}
              onPress={() => savePrice(item.id)}
            >
              <Text style={styles.smallBtnText}>Save Price</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.rowBetween}>
            <Text style={{ color: colors.subtext }}>Available</Text>
            <Switch value={item.isAvailable} onValueChange={() => toggleAvailability(item.id)} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
  tabRow: { flexDirection: 'row', marginBottom: 14 },
  tabBtn: { flex: 1, borderWidth: 1.5, paddingVertical: 8, alignItems: 'center', marginRight: 6, borderRadius: 8 },
  card: { padding: 14, borderRadius: 12, marginBottom: 10, elevation: 2 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap' },
  statusChip: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginRight: 6, marginBottom: 6 },
  rowGap: { flexDirection: 'row' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  smallBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 8 },
  smallBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  priceInput: { borderWidth: 1, borderRadius: 8, padding: 8, width: 90 },
});
