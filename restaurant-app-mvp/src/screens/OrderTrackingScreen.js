// src/screens/OrderTrackingScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useOrders } from '../context/OrdersContext';
import { useTheme } from '../context/ThemeContext';

const ACTIVE_STATUSES = ['Pending', 'Preparing', 'Ready', 'Served'];

export default function OrderTrackingScreen({ route, navigation }) {
  const { orderId } = route.params;
  const { orders, updateStatus } = useOrders();
  const { colors } = useTheme();

  const order = orders.find((o) => o.id === orderId);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!order || order.status === 'Served' || order.status === 'Cancelled') return;

    const currentIndex = ACTIVE_STATUSES.indexOf(order.status);
    const nextStatus = ACTIVE_STATUSES[currentIndex + 1];
    if (!nextStatus) return;

    const timer = setTimeout(() => {
      updateStatus(order.id, nextStatus);
    }, 8000);

    return () => clearTimeout(timer);
  }, [order?.status, order?.id]);

  if (!order) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.text }}>Order not found.</Text>
      </View>
    );
  }

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.primary }]}>Order {order.id.slice(-6)}</Text>
      <Text style={{ color: colors.subtext, marginBottom: 20 }}>
        Elapsed: {minutes}:{seconds.toString().padStart(2, '0')}
      </Text>

      <View style={styles.stagesRow}>
        {ACTIVE_STATUSES.map((status, idx) => {
          const currentIndex = ACTIVE_STATUSES.indexOf(order.status);
          const isDone = idx <= currentIndex;
          return (
            <View key={status} style={styles.stageCol}>
              <View
                style={[
                  styles.stageDot,
                  { borderColor: colors.primary },
                  isDone && { backgroundColor: colors.primary },
                ]}
              />
              <Text style={{ color: isDone ? colors.primary : colors.subtext, fontSize: 11, marginTop: 4 }}>
                {status}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={{ color: colors.text, fontWeight: 'bold', marginBottom: 6 }}>
          {order.orderType === 'Dine-in' ? `Table ${order.table}` : `Pickup at ${order.pickupTime}`}
        </Text>
        {order.items.map((i) => (
          <Text key={i.id} style={{ color: colors.subtext }}>
            {i.quantity} x {i.name}
          </Text>
        ))}
        <Text style={{ color: colors.primary, fontWeight: 'bold', marginTop: 8 }}>
          Total: ${order.total.toFixed(2)}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.doneBtn, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('MenuTab')}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Back to Menu</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  stagesRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  stageCol: { alignItems: 'center', flex: 1 },
  stageDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2 },
  card: { padding: 16, borderRadius: 12, elevation: 2, marginBottom: 20 },
  doneBtn: { padding: 16, borderRadius: 12, alignItems: 'center' },
});
