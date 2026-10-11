// src/screens/ManagerDashboardScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useOrders } from '../context/OrdersContext';
import { useMenu } from '../context/MenuContext';
import { useTheme } from '../context/ThemeContext';
import apiClient from '../api/client';

const TABS = ['Orders', 'Reservations', 'Menu'];
const ORDER_STATUSES = ['Pending', 'Preparing', 'Ready', 'Served', 'Cancelled'];

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
  const { orders, updateStatus, fetchOrders, loading } = useOrders();
  const { colors } = useTheme();
  const [updatingId, setUpdatingId] = useState(null);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await updateStatus(orderId, newStatus);
      Alert.alert('Status Updated', `Order marked as ${newStatus}`);
    } catch (err) {
      Alert.alert('Status Error', err.message || 'Cannot update status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && orders.length === 0) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />;
  }

  return (
    <ScrollView>
      <TouchableOpacity
        style={[styles.refreshBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={fetchOrders}
      >
        <Text style={{ color: colors.primary, fontWeight: 'bold' }}>🔄 Refresh Orders</Text>
      </TouchableOpacity>

      {orders.length === 0 ? (
        <Text style={{ color: colors.subtext, marginTop: 20, textAlign: 'center' }}>No orders yet.</Text>
      ) : (
        orders.map((order) => (
          <View key={order.id} style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={{ color: colors.text, fontWeight: 'bold' }}>
              Order #{(order.id || '').slice(-6)} - {order.orderType === 'Dine-in' ? `Table ${order.table}` : `Pickup ${order.pickupTime}`}
            </Text>
            <Text style={{ color: colors.subtext, marginVertical: 4 }}>
              Customer: {order.user?.fullName || 'Guest'} ({order.user?.email || 'N/A'})
            </Text>
            <Text style={{ color: colors.subtext, marginBottom: 6 }}>
              {(order.items || []).map((i) => `${i.quantity}x ${i.name}`).join(', ')}
            </Text>
            <Text style={{ color: colors.primary, fontWeight: 'bold', marginBottom: 8, fontSize: 16 }}>
              ${Number(order.total).toFixed(2)} - Current Status: {order.status}
            </Text>

            <View style={styles.statusRow}>
              {ORDER_STATUSES.map((status) => (
                <TouchableOpacity
                  key={status}
                  disabled={updatingId === order.id}
                  style={[
                    styles.statusChip,
                    { borderColor: colors.border },
                    order.status === status && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => handleStatusChange(order.id, status)}
                >
                  <Text style={{ fontSize: 10, color: order.status === status ? '#fff' : colors.text }}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function ReservationsTab() {
  const { colors } = useTheme();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient('/api/reservations');
      setReservations(
        (data || []).map((r) => ({
          ...r,
          id: r._id || r.id,
        }))
      );
    } catch (err) {
      console.warn('Error fetching reservations:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await apiClient(`/api/reservations/${id}`, {
        method: 'PATCH',
        body: { status },
      });
      fetchReservations();
      Alert.alert('Reservation Updated', `Reservation marked as ${status}`);
    } catch (err) {
      Alert.alert('Update Failed', err.message);
    }
  };

  if (loading && reservations.length === 0) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />;
  }

  return (
    <ScrollView>
      <TouchableOpacity
        style={[styles.refreshBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={fetchReservations}
      >
        <Text style={{ color: colors.primary, fontWeight: 'bold' }}>🔄 Refresh Reservations</Text>
      </TouchableOpacity>

      {reservations.length === 0 ? (
        <Text style={{ color: colors.subtext, marginTop: 20, textAlign: 'center' }}>No reservations yet.</Text>
      ) : (
        reservations.map((r) => (
          <View key={r.id} style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={{ color: colors.text, fontWeight: 'bold' }}>
              Table {r.tableId} - {r.date} at {r.timeSlot}
            </Text>
            <Text style={{ color: colors.subtext, marginBottom: 8 }}>
              {r.partySize} guests - {r.contactName} ({r.contactPhone}) - Status: {r.status}
            </Text>
            <View style={styles.rowGap}>
              <TouchableOpacity
                style={[styles.smallBtn, { backgroundColor: '#2E7D32' }]}
                onPress={() => handleUpdateStatus(r.id, 'Confirmed')}
              >
                <Text style={styles.smallBtnText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallBtn, { backgroundColor: '#D32F2F' }]}
                onPress={() => handleUpdateStatus(r.id, 'Declined')}
              >
                <Text style={styles.smallBtnText}>Decline</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function MenuTab() {
  const { menuItems, editPrice, toggleAvailability, addItem, fetchMenu } = useMenu();
  const { colors } = useTheme();
  const [priceDrafts, setPriceDrafts] = useState({});

  // Add new item state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Mains');
  const [newEmoji, setNewEmoji] = useState('🍛');

  const savePrice = async (id) => {
    const draft = priceDrafts[id];
    const parsed = parseFloat(draft);
    if (!isNaN(parsed) && parsed >= 0) {
      try {
        await editPrice(id, parsed);
        Alert.alert('Price Updated', 'New price saved to server database.');
      } catch (err) {
        Alert.alert('Update Failed', err.message);
      }
    } else {
      Alert.alert('Invalid Price', 'Please enter a valid non-negative number.');
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleAvailability(id);
    } catch (err) {
      Alert.alert('Toggle Failed', err.message);
    }
  };

  const handleAddNewItem = async () => {
    if (!newName.trim() || !newDesc.trim() || !newPrice.trim()) {
      Alert.alert('Missing Info', 'Please enter name, description, and price.');
      return;
    }
    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      Alert.alert('Invalid Price', 'Price must be non-negative.');
      return;
    }

    try {
      await addItem({
        name: newName.trim(),
        description: newDesc.trim(),
        price: priceNum,
        category: newCategory,
        emoji: newEmoji.trim() || '🍽️',
        isAvailable: true,
      });
      setShowAddForm(false);
      setNewName('');
      setNewDesc('');
      setNewPrice('');
      Alert.alert('Item Added', 'New dish created and saved to MongoDB.');
    } catch (err) {
      Alert.alert('Creation Failed', err.message);
    }
  };

  return (
    <ScrollView>
      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: colors.primary }]}
        onPress={() => setShowAddForm((s) => !s)}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>
          {showAddForm ? '✕ Close Add Form' : '➕ Add New Menu Item'}
        </Text>
      </TouchableOpacity>

      {showAddForm && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.primary, borderWidth: 1 }]}>
          <Text style={[styles.sectionHeading, { color: colors.primary }]}>Create Dish</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            placeholder="Item Name (e.g., Butter Chicken)"
            placeholderTextColor={colors.subtext}
            value={newName}
            onChangeText={setNewName}
          />
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            placeholder="Description"
            placeholderTextColor={colors.subtext}
            value={newDesc}
            onChangeText={setNewDesc}
          />
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            placeholder="Price (e.g., 15.00)"
            placeholderTextColor={colors.subtext}
            keyboardType="decimal-pad"
            value={newPrice}
            onChangeText={setNewPrice}
          />
          <View style={styles.rowBetween}>
            <Text style={{ color: colors.text }}>Emoji Icon:</Text>
            <TextInput
              style={[styles.priceInput, { borderColor: colors.border, color: colors.text, width: 60 }]}
              value={newEmoji}
              onChangeText={setNewEmoji}
            />
          </View>
          <TouchableOpacity
            style={[styles.smallBtn, { backgroundColor: colors.primary, marginTop: 10, alignItems: 'center' }]}
            onPress={handleAddNewItem}
          >
            <Text style={styles.smallBtnText}>Save Dish to Database</Text>
          </TouchableOpacity>
        </View>
      )}

      {menuItems.map((item) => (
        <View key={item.id} style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>
            {item.emoji} {item.name}
          </Text>
          <Text style={{ color: colors.subtext, fontSize: 12, marginBottom: 8 }}>
            Category: {item.category}
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
            <Text style={{ color: colors.subtext }}>Available to Order</Text>
            <Switch value={item.isAvailable} onValueChange={() => handleToggle(item.id)} />
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
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  statusChip: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginRight: 6, marginBottom: 6 },
  rowGap: { flexDirection: 'row' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  smallBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 8 },
  smallBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  priceInput: { borderWidth: 1, borderRadius: 8, padding: 8, width: 90 },
  refreshBtn: { padding: 10, borderRadius: 8, borderWidth: 1, alignItems: 'center', marginBottom: 12 },
  addBtn: { padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 14 },
  sectionHeading: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, padding: 8, marginBottom: 8 },
});
