// src/context/CartContext.js
import React, { createContext, useContext, useReducer } from 'react';
import { cartReducer, initialCartState, isValidPromoCode } from '../reducers/cartReducer';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  const applyPromo = (code) => {
    if (!isValidPromoCode(code)) {
      return { success: false, message: 'Invalid promo code.' };
    }
    dispatch({ type: 'APPLY_PROMO', payload: { code } });
    return { success: true };
  };

  return (
    <CartContext.Provider value={{ state, dispatch, applyPromo }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
