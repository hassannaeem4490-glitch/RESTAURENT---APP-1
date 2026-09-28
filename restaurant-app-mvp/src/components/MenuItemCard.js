// src/components/MenuItemCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

function MenuItemCard({ item, isFavorite, onAddToCart, onToggleFavorite }) {
  // Demonstrates the memoization win from Q8: with stable handlers + React.memo,
  // this log only fires for the card whose favorite/add action was actually pressed.
  console.log(`Rendering card: ${item.name}`);

  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.topRow}>
        <View style={[styles.imageCircle, { backgroundColor: colors.bg }]}>
          <Text style={styles.imageEmoji}>{item.emoji || '🍽️'}</Text>
        </View>

        <View style={styles.infoCol}>
          <View style={styles.headerRow}>
            <Text style={[styles.name, { color: colors.primary }]} numberOfLines={1}>
              {item.name}
            </Text>
            <TouchableOpacity onPress={() => onToggleFavorite(item.id)}>
              <Text style={styles.heart}>{isFavorite ? '♥' : '♡'}</Text>
            </TouchableOpacity>
          </View>

          {item.isSpecial && <Text style={styles.badge}>Daily Special</Text>}

          <Text style={[styles.description, { color: colors.subtext }]} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={[styles.price, { color: colors.text }]}>${item.price.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }, !item.isAvailable && styles.disabledButton]}
        onPress={() => onAddToCart(item)}
        disabled={!item.isAvailable}
      >
        <Text style={styles.buttonText}>{item.isAvailable ? 'Add to Cart' : 'Unavailable'}</Text>
      </TouchableOpacity>
    </View>
  );
}

// Custom comparison isn't required here - default shallow prop comparison is enough
// since isFavorite and the handlers are the only things that change per-card.
export default React.memo(MenuItemCard);

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 15,
    marginBottom: 14,
    elevation: 3,
  },
  topRow: { flexDirection: 'row' },
  imageCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  imageEmoji: { fontSize: 32 },
  infoCol: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 18, fontWeight: 'bold', flexShrink: 1 },
  heart: { fontSize: 22, color: '#D32F2F' },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFD54F',
    color: '#333',
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 6,
  },
  description: { fontSize: 13, marginTop: 6, marginBottom: 8 },
  price: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  button: { paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  disabledButton: { backgroundColor: '#aaa' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
