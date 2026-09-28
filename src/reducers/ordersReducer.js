// src/reducers/ordersReducer.js

// order shape: { id, items, total, orderType, table/pickupTime, status, timestamp }
export function ordersReducer(state, action) {
  switch (action.type) {
    case 'LOAD_ORDERS':
      return action.payload || [];

    case 'ADD_ORDER':
      return [action.payload, ...state];

    case 'UPDATE_STATUS':
      return state.map((o) =>
        o.id === action.payload.id ? { ...o, status: action.payload.status } : o
      );

    default:
      return state;
  }
}

export const ORDER_STATUSES = ['Pending', 'Preparing', 'Ready', 'Served', 'Cancelled'];
