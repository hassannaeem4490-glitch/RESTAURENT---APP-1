// src/screens/LoginScreen.js
// Question 3: Login and Signup Screen (Hooks covered: useState)
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const COLORS = { primary: '#8B0000', bg: '#FFF5F5', text: '#333', border: '#ddd' };

export default function LoginScreen({ navigation }) {
  const { login, signup } = useAuth();

  // mode state variable: switches the whole screen between Login and Signup
  const [mode, setMode] = useState('login'); // 'login' | 'signup'

  // Controlled inputs
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer'); // 'customer' | 'manager'

  // Separate UI state
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*\d).{8,}$/; // at least 8 chars, at least one digit

    if (!emailRegex.test(email)) {
      newErrors.email = 'Enter a valid email address.';
    }
    if (!passwordRegex.test(password)) {
      newErrors.password = 'Password needs 8+ characters and at least one digit.';
    }
    if (mode === 'signup') {
      if (!fullName.trim()) {
        newErrors.fullName = 'Full name is required.';
      }
      if (confirmPassword !== password) {
        newErrors.confirmPassword = 'Passwords do not match.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const user =
        mode === 'login'
          ? await login(email, password)
          : await signup({ fullName, email, password, role });

      // Role-based navigation, resetting the stack so Login isn't in history.
      navigation.reset({
        index: 0,
        routes: [{ name: user.role === 'manager' ? 'ManagerTabs' : 'CustomerTabs' }],
      });
    } catch (err) {
      Alert.alert(mode === 'login' ? 'Login Failed' : 'Signup Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setErrors({});
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🍽️ Hassan's Restaurant</Text>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, mode === 'login' && styles.tabActive]}
          onPress={() => switchMode('login')}
        >
          <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, mode === 'signup' && styles.tabActive]}
          onPress={() => switchMode('signup')}
        >
          <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      {mode === 'signup' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={fullName}
            onChangeText={(t) => {
              setFullName(t);
              clearError('fullName');
            }}
          />
          {errors.fullName && <Text style={styles.error}>{errors.fullName}</Text>}
        </>
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          clearError('email');
        }}
      />
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}

      <View style={styles.passwordRow}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            clearError('password');
          }}
        />
        <TouchableOpacity onPress={() => setShowPassword((s) => !s)} style={styles.showBtn}>
          <Text style={styles.showBtnText}>{showPassword ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>
      {errors.password && <Text style={styles.error}>{errors.password}</Text>}

      {mode === 'signup' && (
        <>
          <TextInput
            style={[styles.input, { marginTop: 20 }]}
            placeholder="Confirm Password"
            secureTextEntry={!showPassword}
            value={confirmPassword}
            onChangeText={(t) => {
              setConfirmPassword(t);
              clearError('confirmPassword');
            }}
          />
          {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword}</Text>}

          <Text style={styles.label}>I am a:</Text>
          <View style={styles.roleRow}>
            <TouchableOpacity
              style={[styles.roleBtn, role === 'customer' && styles.roleBtnActive]}
              onPress={() => setRole('customer')}
            >
              <Text style={role === 'customer' ? styles.roleTextActive : styles.roleText}>
                Customer
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleBtn, role === 'manager' && styles.roleBtnActive]}
              onPress={() => setRole('manager')}
            >
              <Text style={role === 'manager' ? styles.roleTextActive : styles.roleText}>
                Manager
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <TouchableOpacity
        style={[styles.button, isSubmitting && { opacity: 0.7 }]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{mode === 'login' ? 'Login' : 'Create Account'}</Text>
        )}
      </TouchableOpacity>

      {mode === 'login' && (
        <Text style={styles.hint}>
          Try: customer@test.com / Pass1234{'\n'}or manager@test.com / Manager123
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 30, backgroundColor: COLORS.bg },
  title: { fontSize: 30, fontWeight: 'bold', color: COLORS.primary, marginBottom: 30, textAlign: 'center' },
  tabRow: { flexDirection: 'row', marginBottom: 25, backgroundColor: '#fff', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontWeight: 'bold', color: COLORS.primary },
  tabTextActive: { color: '#fff' },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  showBtn: { paddingHorizontal: 12 },
  showBtnText: { color: COLORS.primary, fontWeight: 'bold' },
  error: { color: '#D32F2F', fontSize: 12, marginBottom: 6, marginLeft: 4 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 15, marginBottom: 8, color: COLORS.text },
  roleRow: { flexDirection: 'row', marginBottom: 10 },
  roleBtn: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  roleBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  roleText: { color: COLORS.text },
  roleTextActive: { color: '#fff', fontWeight: 'bold' },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  hint: { marginTop: 20, textAlign: 'center', color: '#888', fontSize: 12 },
});
