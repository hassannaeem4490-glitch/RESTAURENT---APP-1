import React from 'react';
import { Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../context/ThemeContext';

import LoginScreen from '../screens/LoginScreen';
import MenuScreen from '../screens/MenuScreen';
import CartScreen from '../screens/CartScreen';
import OrderSummaryScreen from '../screens/OrderSummaryScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import ReservationScreen from '../screens/ReservationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ManagerDashboardScreen from '../screens/ManagerDashboardScreen';

const RootStack = createNativeStackNavigator();
const CustomerTab = createBottomTabNavigator();
const ManagerTab = createBottomTabNavigator();
const MenuStack = createNativeStackNavigator();

// Nested stack for the Menu tab: Menu -> Order Summary -> Order Tracking.
function MenuStackNavigator() {
  const { colors } = useTheme();
  return (
    <MenuStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
      }}
    >
      <MenuStack.Screen name="Menu" component={MenuScreen} />
      <MenuStack.Screen name="OrderSummary" component={OrderSummaryScreen} options={{ title: 'Order Summary' }} />
      <MenuStack.Screen name="OrderTracking" component={OrderTrackingScreen} options={{ title: 'Track Order' }} />
    </MenuStack.Navigator>
  );
}

const TAB_ICONS = { MenuTab: '🍽️', Cart: '🛒', Reservations: '📅', Profile: '👤', Dashboard: '📋' };

function tabIcon(routeName) {
  return () => <Text style={{ fontSize: 18 }}>{TAB_ICONS[routeName]}</Text>;
}

function CustomerTabs() {
  const { colors } = useTheme();
  return (
    <CustomerTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtext,
        tabBarIcon: tabIcon(route.name),
      })}
    >
      <CustomerTab.Screen name="MenuTab" component={MenuStackNavigator} options={{ title: 'Menu' }} />
      <CustomerTab.Screen name="Cart" component={CartScreen} />
      <CustomerTab.Screen name="Reservations" component={ReservationScreen} />
      <CustomerTab.Screen name="Profile" component={ProfileScreen} />
    </CustomerTab.Navigator>
  );
}

function ManagerTabs() {
  const { colors } = useTheme();
  return (
    <ManagerTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtext,
        tabBarIcon: tabIcon(route.name),
      })}
    >
      <ManagerTab.Screen name="Dashboard" component={ManagerDashboardScreen} />
      <ManagerTab.Screen name="Profile" component={ProfileScreen} />
    </ManagerTab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <RootStack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Login" component={LoginScreen} />
      <RootStack.Screen name="CustomerTabs" component={CustomerTabs} />
      <RootStack.Screen name="ManagerTabs" component={ManagerTabs} />
    </RootStack.Navigator>
  );
}
