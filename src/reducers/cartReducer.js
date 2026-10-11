// src/reducers/cartReducer.js
import { promoCodes } from '../data/promoCodes';

// state shape: { items: [{ id, name, price, quantity, note }], promoCode, discountPercent }
export const initialCartState = {
  items: [],
  promoCode: null,
  discountPercent: 0,
};

export function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const item = action.payload;
      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...item, quantity: 1, note: '' }],
      };
    }

    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.payload.id),
      };
    }

    case 'INCREMENT': {
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      };
    }

    case 'DECREMENT': {
      const target = state.items.find((i) => i.id === action.payload.id);
      if (target && target.quantity <= 1) {
        return {
          ...state,
          items: state.items.filter((i) => i.id !== action.payload.id),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id ? { ...i, quantity: i.quantity - 1 } : i
        ),
      };
    }

    case 'UPDATE_NOTE': {
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id ? { ...i, note: action.payload.note } : i
        ),
      };
    }

    case 'CLEAR_CART': {
      return { ...initialCartState };
    }

    case 'APPLY_PROMO': {
      const code = action.payload.code.toUpperCase();
      const discount = promoCodes[code];
      if (!discount) {
        // invalid code: leave state unchanged, caller shows the error
        return state;
      }
      return { ...state, promoCode: code, discountPercent: discount };
    }

    case 'REMOVE_PROMO': {
      return { ...state, promoCode: null, discountPercent: 0 };
    }

    default:
      return state;
  }
}

export function isValidPromoCode(code) {
  return Boolean(promoCodes[code.toUpperCase()]);
}
