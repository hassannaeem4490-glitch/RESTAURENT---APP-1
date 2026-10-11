// src/screens/ProfileScreen.js
import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme, colors } = useTheme();

  const handleLogout = () => {
    logout();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        <Text style={styles.avatarText}>{user?.fullName?.[0]?.toUpperCase() || '?'}</Text>
      </View>

      <Text style={[styles.name, { color: colors.text }]}>{user?.fullName}</Text>
      <Text style={{ color: colors.subtext, marginBottom: 4 }}>{user?.email}</Text>
      <Text style={[styles.roleBadge, { backgroundColor: colors.primary }]}>{user?.role}</Text>

      <View style={[styles.row, { backgroundColor: colors.card }]}>
        <Text style={{ color: colors.text, fontSize: 16 }}>Dark Mode</Text>
        <Switch value={isDark} onValueChange={toggleTheme} />
      </View>

      <TouchableOpacity style={[styles.logoutBtn, { borderColor: colors.primary }]} onPress={handleLogout}>
        <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 30, paddingTop: 60 },
  avatar: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: 'bold' },
  roleBadge: { color: '#fff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, overflow: 'hidden', marginTop: 8, marginBottom: 30, textTransform: 'capitalize' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: 16, borderRadius: 12, marginBottom: 30 },
  logoutBtn: { borderWidth: 1.5, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
});
