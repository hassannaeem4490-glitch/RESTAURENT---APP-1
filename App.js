// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { MenuProvider } from './src/context/MenuContext';
import { CartProvider } from './src/context/CartContext';
import { OrdersProvider } from './src/context/OrdersContext';
import { ReservationsProvider } from './src/context/ReservationsContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MenuProvider>
          <ReservationsProvider>
            <OrdersProvider>
              <CartProvider>
                <NavigationContainer>
                  <RootNavigator />
                </NavigationContainer>
              </CartProvider>
            </OrdersProvider>
          </ReservationsProvider>
        </MenuProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
