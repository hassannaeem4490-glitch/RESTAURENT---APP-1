// src/screens/OrderTrackingScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useOrders } from '../context/OrdersContext';
import { useTheme } from '../context/ThemeContext';
import apiClient from '../api/client';

const ACTIVE_STATUSES = ['Pending', 'Preparing', 'Ready', 'Served'];

export default function OrderTrackingScreen({ route, navigation }) {
  const { orderId } = route.params;
  const { orders, fetchOrders } = useOrders();
  const { colors } = useTheme();

  const [currentOrder, setCurrentOrder] = useState(
    orders.find((o) => o.id === orderId || o._id === orderId) || null
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // 1-second UI elapsed timer
  useEffect(() => {
    const timer = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Question 7 Requirement 6: Poll GET /api/orders/my every 10 seconds to detect manager updates
  useEffect(() => {
    let isMounted = true;

    const pollOrderStatus = async () => {
      try {
        const myOrders = await apiClient('/api/orders/my');
        if (!isMounted) return;
        const matching = (myOrders || []).find(
          (o) => (o._id || o.id) === orderId
        );
        if (matching) {
          setCurrentOrder({
            ...matching,
            id: matching._id || matching.id,
          });
        }
      } catch (err) {
        console.warn('Order polling error:', err.message);
      }
    };

    // Initial fetch immediately
    pollOrderStatus();

    // Poll every 10 seconds
    const intervalId = setInterval(pollOrderStatus, 10000);

    // Clean up interval when screen unmounts
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [orderId]);

  // Keep synced with context orders as well
  useEffect(() => {
    const found = orders.find((o) => o.id === orderId || o._id === orderId);
    if (found) {
      setCurrentOrder(found);
    }
  }, [orders, orderId]);

  if (!currentOrder) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 12 }}>Locating your order...</Text>
      </View>
    );
  }

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.primary }]}>
        Order #{(currentOrder.id || currentOrder._id || '').slice(-6)}
      </Text>
      <Text style={{ color: colors.subtext, marginBottom: 20 }}>
        Elapsed: {minutes}:{seconds.toString().padStart(2, '0')} (Status updates live every 10s)
      </Text>

      <View style={styles.stagesRow}>
        {ACTIVE_STATUSES.map((status, idx) => {
          const currentIndex = ACTIVE_STATUSES.indexOf(currentOrder.status);
          const isDone = currentIndex !== -1 && idx <= currentIndex;
          return (
            <View key={status} style={styles.stageCol}>
              <View
                style={[
                  styles.stageDot,
                  { borderColor: colors.primary },
                  isDone && { backgroundColor: colors.primary },
                ]}
              />
              <Text
                style={{
                  color: isDone ? colors.primary : colors.subtext,
                  fontSize: 11,
                  marginTop: 4,
                  fontWeight: isDone ? 'bold' : 'normal',
                }}
              >
                {status}
              </Text>
            </View>
          );
        })}
      </View>

      {currentOrder.status === 'Cancelled' && (
        <View style={styles.cancelledBadge}>
          <Text style={styles.cancelledText}>⚠️ This order was Cancelled</Text>
        </View>
      )}

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={{ color: colors.text, fontWeight: 'bold', marginBottom: 6 }}>
          {currentOrder.orderType === 'Dine-in'
            ? `Table ${currentOrder.table}`
            : `Pickup at ${currentOrder.pickupTime}`}
        </Text>
        {(currentOrder.items || []).map((i, index) => (
          <Text key={i.menuItem || index} style={{ color: colors.subtext, marginVertical: 2 }}>
            {i.quantity} x {i.name} (${Number(i.price).toFixed(2)})
          </Text>
        ))}
        <Text style={{ color: colors.primary, fontWeight: 'bold', marginTop: 8, fontSize: 16 }}>
          Total: ${Number(currentOrder.total).toFixed(2)}
        </Text>
        <Text style={{ color: colors.subtext, fontSize: 12, marginTop: 4 }}>
          Status: {currentOrder.status}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.doneBtn, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('CustomerTabs', { screen: 'MenuTab' })}
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
  cancelledBadge: {
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  cancelledText: { color: '#C62828', fontWeight: 'bold' },
});
