# restaurant-app-mvp

Frontend-only React Native (Expo) Restaurant App MVP.

## Run it on your phone (Expo Go)

Run these commands in order, from inside this folder, in a VS Code terminal:

```
npm install
npx expo install expo@^57.0.0
npx expo install --fix
npx expo start
```

Then scan the QR code with the Expo Go app (Android: in-app scanner. iOS: Camera app).
Phone and computer must be on the same Wi-Fi — if it won't connect, run `npx expo start --tunnel` instead.

(The middle two commands upgrade the project to Expo SDK 57 to match current Expo Go. If your Expo Go app is already SDK 54, you can skip them.)

## Login credentials
- Customer: `customer@test.com` / `Pass1234`
- Manager: `manager@test.com` / `Manager123`
- Or tap **Sign Up** to create your own account (pick Customer or Manager role).

## What's implemented, by hook

| Screen / Feature | Hooks used | Notes |
|---|---|---|
| Login / Signup | `useState` | Mode toggle, validation, simulated network delay + spinner, role-based routing |
| Menu Browsing | `useEffect` | Simulated loading, pull-to-refresh, category filter, dynamic header count |
| Search & Scroll | `useRef` | Debounced search (via `useDebounce`), scroll-to-top, render counter, recent searches |
| Auth/Theme | `useContext` | `AuthContext` + `ThemeContext`, dark mode toggle on Profile screen |
| Cart | `useReducer` | Add/remove/increment/decrement/notes/promo codes (`WELCOME10`, `FEAST20`) |
| Order Summary | `useMemo` | Subtotal, 5% service charge, 15% tax, discount, grand total |
| Menu Card | `React.memo` + `useCallback` | Avoids re-rendering every card when one favorite/cart action fires |
| Reservations | custom `useReservation` hook | Table/time-slot availability, validation, cancel |
| Order Tracking | `useEffect` (`setInterval`/`setTimeout`) | Elapsed timer, auto status progression: Pending → Preparing → Ready → Served |
| Manager Dashboard | — | Orders (status control), Reservations (accept/decline), Menu (price edit + availability toggle) |
| Persistence | `AsyncStorage` | Orders, reservations, and menu edits survive an app restart |

## Project structure
```
App.js
index.js
src/
  components/   MenuItemCard.js
  context/      AuthContext, ThemeContext, MenuContext, CartContext, OrdersContext, ReservationsContext
  data/         users.js, menu.js, tables.js, promoCodes.js
  hooks/        useForm.js, useDebounce.js, useReservation.js
  navigation/   RootNavigator.js (Login → role-based bottom tabs, Menu tab is a nested stack)
  reducers/     cartReducer.js, ordersReducer.js
  screens/      LoginScreen, MenuScreen, CartScreen, OrderSummaryScreen, OrderTrackingScreen,
                ReservationScreen, ProfileScreen, ManagerDashboardScreen
```

## Note on menu images
Menu items use food emoji as their "image" instead of photos. This was a deliberate choice, not a placeholder: bundling real photo assets means either shipping large binary files in the zip or pointing at external image URLs, both of which can silently fail to load on a phone with a spotty connection during a demo. Emoji render instantly, everywhere, with zero risk of a broken image icon.
