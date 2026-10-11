# Restaurant App MVP (Assignment 2)

Full-stack Restaurant Application featuring a **React Native (Expo)** mobile frontend connected to a **Node.js & Express** backend with **MongoDB (Mongoose ODM)** database persistence.

---

## 🚀 How to Run the Backend Server

The backend is located in the `server/` directory in the repository root.

### 1. Install Server Dependencies
Open a terminal in the root or inside `server`:
```bash
cd server
npm install
```

### 2. Configure Environment Variables
Create a `.env` file inside the `server/` folder (or copy `.env.example`):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/restaurant_app
JWT_SECRET=supersecretjwtkey_restaurantapp_fall2026
```
*(If you are using MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/restaurant_app?retryWrites=true&w=majority`)*

### 3. Seed the Database
Populate the database with the initial 16 menu items, 8 tables, and seeded accounts:
```bash
npm run seed
```

### 4. Start the Server
- Development mode (with auto-reload via `nodemon`):
  ```bash
  npm run dev
  ```
- Production mode:
  ```bash
  npm start
  ```
Verify the server is running by opening: `http://localhost:5000/api/health`

---

## 📱 How to Run the Mobile App (React Native / Expo)

From the project root:
```bash
npm install
npx expo start
```
Scan the QR code with **Expo Go** (Android / iOS) or press `w` to open in your web browser.

### ⚠️ Where to Change `BASE_URL` (Crucial for Mobile Testing)
When running on a physical phone via Expo Go, your phone cannot reach `localhost`. You must point the app to your laptop's Wi-Fi IP address.

1. Find your laptop's IP address:
   - Windows: Run `ipconfig` in Command Prompt (look for *IPv4 Address*, e.g., `192.168.1.15`).
2. Open `src/api/client.js` and set:
   ```javascript
   export const BASE_URL = 'http://192.168.1.15:5000'; // Replace with your laptop's IP
   ```
3. Make sure your phone and laptop are connected to the **same Wi-Fi network**.

---

## 🔑 Login Credentials

The database comes pre-seeded with two active accounts:

| Role | Email | Password |
|---|---|---|
| **Customer** | `customer@test.com` | `Pass1234` |
| **Manager** | `manager@test.com` | `Manager123` |

You can also tap **Sign Up** on the app's login screen to register a new account.

---

## 📋 API Endpoints Table

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Health check route (`{ status: 'ok', time }`) |
| `POST` | `/api/auth/register` | Public | Register new customer or manager |
| `POST` | `/api/auth/login` | Public | Login and receive JWT Bearer token |
| `GET` | `/api/auth/profile` | Protected | Get profile for currently authenticated user |
| `GET` | `/api/menu` | Public | Fetch all menu items (supports `?category=` & `?search=`) |
| `GET` | `/api/menu/:id` | Public | Fetch single item by ID (validates ObjectId) |
| `POST` | `/api/menu` | Manager | Add new menu item to database |
| `PUT` | `/api/menu/:id` | Manager | Update price or toggle availability |
| `DELETE` | `/api/menu/:id` | Manager | Delete menu item from database |
| `POST` | `/api/orders` | Customer | Place order with authoritative database pricing |
| `GET` | `/api/orders/my` | Customer | Fetch current customer's order history |
| `GET` | `/api/orders` | Manager | Fetch all incoming orders for kitchen management |
| `PATCH` | `/api/orders/:id/status`| Manager | Update order status (Pending → Preparing → Ready → Served) |
| `GET` | `/api/reservations/tables` | Public | Fetch configured tables and seat counts |
| `POST` | `/api/reservations` | Customer | Create booking (checks table capacity & slot conflicts) |
| `GET` | `/api/reservations/my` | Customer | Fetch customer's active and past bookings |
| `GET` | `/api/reservations` | Manager | View all bookings |
| `PATCH` | `/api/reservations/:id` | Manager | Accept (`Confirmed`) or Decline (`Declined`) reservation |
| `PATCH` | `/api/reservations/:id/cancel`| Customer | Cancel reservation |

---

## 🧪 Postman Collection & Testing

A complete Postman test suite is provided in:
📁 `A2/restaurant-api.postman_collection.json`

Import this file into Postman or Thunder Client to execute test requests covering:
- Authentication flow & JWT storage
- Menu queries & role-based route blocking (401, 403, 201)
- Negative price validation (400)
- Double-booking reservation collision handling (409)
- Forward-only order status progression rules (400)

---

## 📂 Project Structure

```
restaurant-app-mvp/
├── A2/
│   ├── restaurant-api.postman_collection.json
│   ├── SRS_v2.md
│   ├── er_diagram_A2.png
│   ├── deployment_diagram_A2.png
│   └── sequence_diagram_A2.png
├── demo pictures/
│   ├── APPEARENCE.jpg
│   ├── CART.jpg
│   ├── MENU.jpg
│   ├── RESERVATIONS.jpg
│   ├── login.PNG
│   ├── er_diagram_A2.png
│   ├── deployment_diagram_A2.png
│   └── sequence_diagram_A2.png
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── menuController.js
│   │   ├── orderController.js
│   │   └── reservationController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── MenuItem.js
│   │   ├── Order.js
│   │   ├── Reservation.js
│   │   ├── Table.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── menuRoutes.js
│   │   ├── orderRoutes.js
│   │   └── reservationRoutes.js
│   ├── .env.example
│   ├── package.json
│   ├── seed.js
│   └── server.js
├── src/
│   ├── api/
│   │   └── client.js
│   ├── components/
│   ├── context/
│   ├── hooks/
│   │   ├── useApi.js
│   │   ├── useDebounce.js
│   │   ├── useForm.js
│   │   └── useReservation.js
│   ├── navigation/
│   ├── reducers/
│   └── screens/
├── App.js
├── index.js
├── package.json
└── README.md
```

---

## 🎥 Multi-Device Demo Recording
- **Video Link:** *[Insert screen recording link here prior to submission]*
