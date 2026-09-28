// src/screens/CartScreen.js
import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export default function CartScreen({ navigation }) {
  const { state, dispatch, applyPromo } = useCart();
  const { colors } = useTheme();
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  const handleApplyPromo = () => {
    const result = applyPromo(promoInput.trim());
    if (!result.success) {
      setPromoError(result.message);
    } else {
      setPromoError('');
      setPromoInput('');
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.rowBetween}>
        <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
        <TouchableOpacity onPress={() => dispatch({ type: 'REMOVE_ITEM', payload: { id: item.id } })}>
          <Text style={{ color: '#D32F2F' }}>Remove</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rowBetween}>
        <View style={styles.stepper}>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => dispatch({ type: 'DECREMENT', payload: { id: item.id } })}
          >
            <Text style={styles.stepText}>-</Text>
          </TouchableOpacity>
          <Text style={{ marginHorizontal: 10, color: colors.text }}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => dispatch({ type: 'INCREMENT', payload: { id: item.id } })}
          >
            <Text style={styles.stepText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ color: colors.primary, fontWeight: 'bold' }}>
          ${(item.price * item.quantity).toFixed(2)}
        </Text>
      </View>

      <TextInput
        style={[styles.noteInput, { borderColor: colors.border, color: colors.text }]}
        placeholder="Special instructions (e.g. no onions)"
        placeholderTextColor={colors.subtext}
        value={item.note}
        onChangeText={(text) => dispatch({ type: 'UPDATE_NOTE', payload: { id: item.id, note: text } })}
      />
    </View>
  );

  if (state.items.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.subtext }}>Your cart is empty. Go add something tasty!</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <FlatList
        data={state.items}
        keyExtractor={(i) => i.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 10 }}
      />

      <View style={[styles.promoRow, { backgroundColor: colors.card }]}>
        {state.promoCode ? (
          <View style={styles.rowBetween}>
            <Text style={{ color: colors.text }}>
              Applied: <Text style={{ fontWeight: 'bold' }}>{state.promoCode}</Text> (-
              {state.discountPercent}%)
            </Text>
            <TouchableOpacity onPress={() => dispatch({ type: 'REMOVE_PROMO' })}>
              <Text style={{ color: '#D32F2F' }}>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.rowBetween}>
              <TextInput
                style={[styles.promoInput, { borderColor: colors.border, color: colors.text }]}
                placeholder="Promo code (try WELCOME10)"
                placeholderTextColor={colors.subtext}
                autoCapitalize="characters"
                value={promoInput}
                onChangeText={setPromoInput}
              />
              <TouchableOpacity
                style={[styles.applyBtn, { backgroundColor: colors.primary }]}
                onPress={handleApplyPromo}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Apply</Text>
              </TouchableOpacity>
            </View>
            {promoError ? <Text style={{ color: '#D32F2F', fontSize: 12 }}>{promoError}</Text> : null}
          </>
        )}
      </View>

      <TouchableOpacity
        style={[styles.checkoutBtn, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('OrderSummary')}
      >
        <Text style={styles.checkoutText}>Proceed to Order Summary</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { padding: 14, borderRadius: 12, marginBottom: 10, elevation: 2 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4 },
  name: { fontWeight: 'bold', fontSize: 16 },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  stepBtn: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#eee', borderRadius: 6 },
  stepText: { fontWeight: 'bold', fontSize: 16 },
  noteInput: { borderWidth: 1, borderRadius: 8, padding: 8, marginTop: 6, fontSize: 13 },
  promoRow: { padding: 12, borderRadius: 12, marginBottom: 12 },
  promoInput: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 10, marginRight: 8 },
  applyBtn: { paddingHorizontal: 16, justifyContent: 'center', borderRadius: 8 },
  checkoutBtn: { padding: 16, borderRadius: 12, alignItems: 'center' },
  checkoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
