// src/screens/MenuScreen.js
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useMenu } from '../context/MenuContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import useDebounce from '../hooks/useDebounce';
import { categories } from '../data/menu';
import MenuItemCard from '../components/MenuItemCard';

const SORT_OPTIONS = [
  { key: 'default', label: 'Default' },
  { key: 'priceAsc', label: 'Price: Low to High' },
  { key: 'priceDesc', label: 'Price: High to Low' },
  { key: 'nameAsc', label: 'Name: A to Z' },
];

export default function MenuScreen({ navigation }) {
  const { menuItems: rawMenuItems } = useMenu();
  const { dispatch } = useCart();
  const { colors } = useTheme();

  // --- Q4: loading simulation ---
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [reloadToken, setReloadToken] = useState(0); // bump to retry/refresh

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      if (isCancelled) return; // cleanup guard: no state update after unmount
      setIsLoading(false);
      setRefreshing(false);
    }, 1500);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [reloadToken]);

  const handleRetry = () => setReloadToken((t) => t + 1);
  const onRefresh = () => {
    setRefreshing(true);
    setReloadToken((t) => t + 1);
  };

  // --- Q4: category chips ---
  const [selectedCategory, setSelectedCategory] = useState(null); // null = All

  // --- Q5: search with useRef + useDebounce (hook version, per Q9 refactor) ---
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 400);
  const searchInputRef = useRef(null);
  const previousQueryRef = useRef('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const trimmed = debouncedSearch.trim();
    if (trimmed && trimmed !== previousQueryRef.current) {
      previousQueryRef.current = trimmed;
      setRecentSearches((prev) => [trimmed, ...prev.filter((s) => s !== trimmed)].slice(0, 5));
    }
  }, [debouncedSearch]);

  // --- Q5: scroll ref + back-to-top ---
  const listRef = useRef(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const handleScroll = (e) => {
    setShowBackToTop(e.nativeEvent.contentOffset.y > 300);
  };
  const scrollToTop = () => listRef.current?.scrollToOffset({ offset: 0, animated: true });

  // --- Q5: render counter (a ref, so counting it never causes a re-render itself) ---
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;

  // --- Q8: favorites ---
  const [favoriteIds, setFavoriteIds] = useState([]);
  const toggleFavorite = useCallback((id) => {
    setFavoriteIds((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  }, []);

  const handleAddToCart = useCallback(
    (item) => {
      dispatch({ type: 'ADD_ITEM', payload: item });
    },
    [dispatch]
  );

  // --- Q8: sort ---
  const [sortBy, setSortBy] = useState('default');

  // --- Q8: single useMemo replaces the Q4 filteredItems-state-plus-effect approach.
  // Filtering/sorting is derived data - it can always be recomputed from menuItems,
  // selectedCategory, searchText and sortBy, so storing it in its own state would just
  // be a second source of truth that could drift out of sync. useMemo recomputes it
  // only when one of those actually changes.
  const filteredItems = useMemo(() => {
    let items = [...rawMenuItems];

    if (selectedCategory) {
      items = items.filter((i) => i.category === selectedCategory);
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      items = items.filter(
        (i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'priceAsc') items.sort((a, b) => a.price - b.price);
    if (sortBy === 'priceDesc') items.sort((a, b) => b.price - a.price);
    if (sortBy === 'nameAsc') items.sort((a, b) => a.name.localeCompare(b.name));

    return items;
  }, [rawMenuItems, selectedCategory, debouncedSearch, sortBy]);

  // --- Q4: update header title with count shown ---
  useEffect(() => {
    navigation.setOptions({ title: `Menu (${filteredItems.length})` });
  }, [filteredItems.length, navigation]);

  const clearSearch = () => {
    setSearchText('');
    searchInputRef.current?.focus();
  };

  const renderItem = ({ item }) => (
    <MenuItemCard
      item={item}
      isFavorite={favoriteIds.includes(item.id)}
      onAddToCart={handleAddToCart}
      onToggleFavorite={toggleFavorite}
    />
  );

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 10 }}>Loading menu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.text, marginBottom: 15 }}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={handleRetry}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.searchRow}>
        <TouchableOpacity onPress={() => searchInputRef.current?.focus()} style={styles.searchIcon}>
          <Text>🔍</Text>
        </TouchableOpacity>
        <TextInput
          ref={searchInputRef}
          style={[styles.searchInput, { backgroundColor: colors.card, color: colors.text }]}
          placeholder="Search the menu..."
          placeholderTextColor={colors.subtext}
          value={searchText}
          onChangeText={setSearchText}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearBtn}>
            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {isSearchFocused && searchText.length === 0 && recentSearches.length > 0 && (
        <View style={styles.suggestionsRow}>
          {recentSearches.map((term) => (
            <TouchableOpacity
              key={term}
              style={[styles.suggestionChip, { borderColor: colors.border }]}
              onPress={() => setSearchText(term)}
            >
              <Text style={{ color: colors.text, fontSize: 12 }}>{term}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.chipsRow}>
        <TouchableOpacity
          style={[
            styles.chip,
            { borderColor: colors.primary },
            !selectedCategory && { backgroundColor: colors.primary },
          ]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={{ color: !selectedCategory ? '#fff' : colors.primary, fontWeight: 'bold' }}>
            All
          </Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.chip,
              { borderColor: colors.primary },
              selectedCategory === cat && { backgroundColor: colors.primary },
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={{ color: selectedCategory === cat ? '#fff' : colors.primary, fontWeight: 'bold' }}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.chipsRow}>
        {SORT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.sortChip,
              { borderColor: colors.border },
              sortBy === opt.key && { borderColor: colors.primary },
            ]}
            onPress={() => setSortBy(opt.key)}
          >
            <Text style={{ color: colors.text, fontSize: 11 }}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.debugLabel}>Renders: {renderCountRef.current}</Text>

      {filteredItems.length === 0 ? (
        <View style={styles.centered}>
          <Text style={{ color: colors.subtext }}>No items match your search.</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={filteredItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {showBackToTop && (
        <TouchableOpacity
          style={[styles.backToTop, { backgroundColor: colors.primary }]}
          onPress={scrollToTop}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>↑ Top</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  searchIcon: { padding: 8 },
  searchInput: { flex: 1, padding: 12, borderRadius: 10 },
  clearBtn: { padding: 8 },
  suggestionsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  suggestionChip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  chip: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 6,
  },
  sortChip: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  debugLabel: { fontSize: 10, color: '#999', marginBottom: 6 },
  retryButton: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  retryText: { color: '#fff', fontWeight: 'bold' },
  backToTop: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 4,
  },
});
