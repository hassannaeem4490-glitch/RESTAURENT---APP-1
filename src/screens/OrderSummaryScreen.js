// src/screens/OrderSummaryScreen.js
import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrdersContext';
import { useTheme } from '../context/ThemeContext';

const SERVICE_CHARGE_RATE = 0.05;
const SALES_TAX_RATE = 0.15;

export default function OrderSummaryScreen({ navigation }) {
  const { state, dispatch } = useCart();
  const { placeOrder } = useOrders();
  const { colors } = useTheme();

  const [orderType, setOrderType] = useState('Dine-in'); // 'Dine-in' | 'Takeaway'
  const [tableNumber, setTableNumber] = useState('');
  const [pickupTime, setPickupTime] = useState('');

  // Depends only on cart items and discount - won't recompute on unrelated re-renders.
  const totals = useMemo(() => {
    const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const serviceCharge = subtotal * SERVICE_CHARGE_RATE;
    const salesTax = subtotal * SALES_TAX_RATE;
    const discount = (subtotal * state.discountPercent) / 100;
    const grandTotal = subtotal + serviceCharge + salesTax - discount;
    return { subtotal, serviceCharge, salesTax, discount, grandTotal };
  }, [state.items, state.discountPercent]);

  const handlePlaceOrder = () => {
    if (state.items.length === 0) {
      Alert.alert('Cart is empty', 'Add something from the menu first.');
      return;
    }
    if (orderType === 'Dine-in' && !tableNumber.trim()) {
      Alert.alert('Missing info', 'Please enter your table number.');
      return;
    }
    if (orderType === 'Takeaway' && !pickupTime.trim()) {
      Alert.alert('Missing info', 'Please enter a pickup time.');
      return;
    }

    const order = placeOrder({
      items: state.items,
      total: totals.grandTotal,
      orderType,
      table: orderType === 'Dine-in' ? tableNumber : null,
      pickupTime: orderType === 'Takeaway' ? pickupTime : null,
    });

    dispatch({ type: 'CLEAR_CART' });
    navigation.navigate('OrderTracking', { orderId: order.id });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.primary }]}>Order Summary</Text>

      {state.items.map((item) => (
        <View key={item.id} style={styles.itemRow}>
          <Text style={{ color: colors.text }}>
            {item.quantity} x {item.name}
          </Text>
          <Text style={{ color: colors.text }}>${(item.price * item.quantity).toFixed(2)}</Text>
        </View>
      ))}

      <View style={styles.divider} />

      <View style={styles.itemRow}>
        <Text style={{ color: colors.subtext }}>Subtotal</Text>
        <Text style={{ color: colors.text }}>${totals.subtotal.toFixed(2)}</Text>
      </View>
      <View style={styles.itemRow}>
        <Text style={{ color: colors.subtext }}>Service Charge (5%)</Text>
        <Text style={{ color: colors.text }}>${totals.serviceCharge.toFixed(2)}</Text>
      </View>
      <View style={styles.itemRow}>
        <Text style={{ color: colors.subtext }}>Sales Tax (15%)</Text>
        <Text style={{ color: colors.text }}>${totals.salesTax.toFixed(2)}</Text>
      </View>
      {state.discountPercent > 0 && (
        <View style={styles.itemRow}>
          <Text style={{ color: colors.subtext }}>Discount ({state.discountPercent}%)</Text>
          <Text style={{ color: '#2E7D32' }}>-${totals.discount.toFixed(2)}</Text>
        </View>
      )}
      <View style={styles.itemRow}>
        <Text style={[styles.totalLabel, { color: colors.primary }]}>Grand Total</Text>
        <Text style={[styles.totalLabel, { color: colors.primary }]}>
          ${totals.grandTotal.toFixed(2)}
        </Text>
      </View>

      <View style={styles.divider} />

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Type</Text>
      <View style={styles.rowBtns}>
        <TouchableOpacity
          style={[
            styles.typeBtn,
            { borderColor: colors.primary },
            orderType === 'Dine-in' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setOrderType('Dine-in')}
        >
          <Text style={{ color: orderType === 'Dine-in' ? '#fff' : colors.primary, fontWeight: 'bold' }}>
            Dine-in
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeBtn,
            { borderColor: colors.primary },
            orderType === 'Takeaway' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setOrderType('Takeaway')}
        >
          <Text style={{ color: orderType === 'Takeaway' ? '#fff' : colors.primary, fontWeight: 'bold' }}>
            Takeaway
          </Text>
        </TouchableOpacity>
      </View>

      {orderType === 'Dine-in' ? (
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder="Table number"
          placeholderTextColor={colors.subtext}
          value={tableNumber}
          onChangeText={setTableNumber}
        />
      ) : (
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder="Pickup time (e.g. 19:30)"
          placeholderTextColor={colors.subtext}
          value={pickupTime}
          onChangeText={setPickupTime}
        />
      )}

      <TouchableOpacity
        style={[styles.placeOrderBtn, { backgroundColor: colors.primary }]}
        onPress={handlePlaceOrder}
      >
        <Text style={styles.placeOrderText}>Place Order</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  divider: { height: 1, backgroundColor: '#ddd', marginVertical: 12 },
  totalLabel: { fontWeight: 'bold', fontSize: 17 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 8 },
  rowBtns: { flexDirection: 'row', marginBottom: 12 },
  typeBtn: { flex: 1, padding: 12, borderWidth: 1.5, borderRadius: 10, alignItems: 'center', marginRight: 8 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16 },
  placeOrderBtn: { padding: 16, borderRadius: 12, alignItems: 'center' },
  placeOrderText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
