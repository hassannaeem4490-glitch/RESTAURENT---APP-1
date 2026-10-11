# Software Requirements Specification (SRS_v2)
### Hassan's Restaurant Mobile App: React Native, Node.js, Express and MongoDB (Assignment 2, Fall 2026)

**Prepared by:** Hassan Naeem, AUIC Islamabad | **Version:** 2.0 (revision of the A1 SRS) | **Date:** October 2026

---

## 1. Introduction

### 1.1 Purpose
In A1 the app ran only on mock data stored on each phone. Version 2 adds an Express server and a MongoDB database so every phone reads and writes the same menu, orders and bookings. This SRS lists what the system must do and how data and API calls are organised.

### 1.2 Scope

| In scope | Out of scope |
| :--- | :--- |
| A1 customer features (signup/login, menu, cart, orders, tracking, reservations, profile) and manager features (menu management, orders, reservations).<br><br>Backend (now in scope): REST API with Node.js, Express and MongoDB, JWT login, bcrypt passwords, role checks, server side validation, seed script. | Real payments.<br>Push notifications (status is polled instead).<br>Real food photos (emoji icons are used).<br>Cloud deployment of the server (it runs on the laptop). |

#### Problems found in A1 and how each is fixed

| # | Problem in A1 | Fix in A2 |
| :---: | :--- | :--- |
| 1 | Manager changes a price on his phone, customers still see the old one. | Menu lives in MongoDB. All phones call `GET /api/menu`; manager edits with `PUT /api/menu/:id`. |
| 2 | Marking a dish unavailable only affected one phone. | `available` flag is saved in the database and the server rejects orders containing unavailable items. |
| 3 | Orders vanish on reinstall and are invisible on a second phone. | Orders are saved with the user id. `GET /api/orders/my` works on any device after login. |
| 4 | Two phones could book the same table at the same time. | Server checks seats, date and time and returns 409 if the table is taken. |
| 5 | Accounts and plain-text passwords sat in a mock file in the app. | Users are in the database, passwords hashed with bcrypt, login returns a 1 day JWT. |
| 6 | Order tracking used a fake timer; manager had no real effect. | Manager updates status via PATCH. Tracking screen polls `GET /api/orders/my` every 10 s. |
| 7 | Order total was calculated on the phone and could be wrong or edited. | Server recalculates the total from database prices and ignores the app total. |
| 8 | Nothing stopped a customer from using manager actions. | Menu write endpoints need `protect` and `managerOnly` (401 / 403). |

---

### 1.3 Definitions

| Term | Meaning |
| :--- | :--- |
| **API / Endpoint** | API: the set of server URLs the app calls. Endpoint: one URL plus HTTP method, e.g. `POST /api/orders`. |
| **REST** | API style where URLs name things (`/api/menu`) and HTTP methods (GET, POST, PUT, PATCH, DELETE) say the action. |
| **JSON** | Text format used for request and response bodies. |
| **MongoDB / Collection** | MongoDB stores JSON-like documents. A collection is a group of similar documents (like a table), e.g. orders. |
| **Mongoose** | Node.js library that defines schemas and models for MongoDB and validates data before saving. |
| **Middleware** | Express function that runs before the controller, e.g. to check a token or role. |
| **JWT** | Signed token returned at login and sent as `Authorization: Bearer <token>` to prove identity. |
| **HTTP Status Code** | Number showing the result: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 500 Server Error. |
| **bcrypt / Seeding / Polling** | bcrypt: one-way password hashing. Seeding: script that resets and fills collections. Polling: asking the server again every fixed interval. |

---

## 2. Overall Description

Three tiers: the **React Native app** (Expo, React Navigation, Context, reducers, custom hooks) shows screens and stores only the login token; the **Express server** (cors, dotenv, bcryptjs, jsonwebtoken) holds all rules; **MongoDB** (database `restaurant_app`, via Mongoose) is the only place data is stored. The phone and laptop must be on the same Wi-Fi (`BASE_URL` in `src/api/client.js`; `10.0.2.2` for the Android emulator).

| User | Abilities |
| :--- | :--- |
| **Customer** | Register, log in, view menu, order, track own orders, book tables, see own bookings. |
| **Manager** | Everything above plus add/edit/delete menu items, toggle availability, see all orders, change order status, accept or decline bookings. |
| **Visitor** | View the menu, register or log in. |

---

## 3. Functional Requirements

| ID | Requirement |
| :--- | :--- |
| **FR-1** | Register (duplicate email gives 409) and log in. Login returns a token valid for one day with name, email and role. The password is never returned. |
| **FR-2** | The app keeps the token and user in `AuthContext` and `AsyncStorage` so login survives closing the app. Logout clears both. |
| **FR-3** | Anyone can view the menu with category filter and case insensitive name search. Screens show loading, error with Retry, and pull to refresh. |
| **FR-4** | Only a manager can add, edit, delete items or toggle availability. The list reloads from the server after each change. |
| **FR-5** | Cart is kept in the app (reducer). Placing an order sends item ids and quantities; the server calculates the total from database prices and rejects unavailable items. |
| **FR-6** | Customers see only their own orders; managers see all. Status moves only Pending, Preparing, Ready, Served. Cancelled is allowed only from Pending, otherwise 400. |
| **FR-7** | Order Tracking polls every 10 seconds and clears the interval when the screen closes. |
| **FR-8** | A reservation needs table, date, time and guests. The server checks seats and that the table is free at that time (else 409). Manager accepts or declines. |
| **FR-9** | Protected endpoints need `Authorization: Bearer <token>` (401 if missing). Manager-only endpoints return 403 for customers. Unknown routes return 404 "Route not found"; unexpected errors return JSON with 500. |
| **FR-10** | Seed script empties the collections and inserts one customer, one manager (hashed passwords), 15 menu items and 6 tables. |

---

## 4. Non-Functional Requirements

- **Security:** bcrypt hashes, JWT secret only in `.env` (never committed), role checks on the server, no password in any response.
- **Reliability:** invalid input or invalid ids return JSON errors and never crash the server; if MongoDB fails at start the server logs the error and exits.
- **Performance and usability:** list requests respond in about 2 s on the local network; every data screen has loading and retry states.
- **Maintainability:** routes only map URLs, controllers hold logic, models hold schemas, middleware handles auth; API calls are isolated in `src/api/client.js`.

---

## 5. Database Design (replaces the A1 mock data section)

| Collection | Fields and types | Relationships and rules |
| :--- | :--- | :--- |
| **Users** | `name` String, required<br>`email` String, required, unique<br>`password` String, required (hashed)<br>`role` enum [customer, manager], default customer | Email unique. Referenced by Orders and Reservations. Hash never sent back. |
| **MenuItems** | `name` String, required<br>`description` String<br>`price` Number, required, min 0<br>`category` String, required<br>`available` Boolean, default true | Only a manager can write. Orders store the item id plus a copy of name and price at order time. |
| **Tables** | `number` Number, required, unique<br>`seats` Number, required, min 1 | Referenced by Reservations. Guests cannot exceed seats. |
| **Reservations** | `user` ObjectId (ref Users), required<br>`table` ObjectId (ref Tables), required<br>`date`, `time` String, required<br>`guests` Number, min 1<br>`status` enum [Pending, Accepted, Declined]<br>`timestamps` createdAt, updatedAt | One user and one table per booking. Same table, date and time cannot be booked twice (409). |
| **Orders** | `user` ObjectId (ref Users), required<br>`items` [ { `menuItem` ref MenuItems, `name`, `price`, `quantity` min 1 } ]<br>`total` Number (server calculated)<br>`status` enum [Pending, Preparing, Ready, Served, Cancelled], default Pending<br>`timestamps` createdAt, updatedAt | Each order stores the id of the user who placed it. Status only moves forward; Cancelled only from Pending. |

<br>

![Figure 1: Collections and their references](er_diagram_A2.png)

*Figure 1: Collections and their references*

---

## 6. Screens and Data Sources

| Screen | Data source |
| :--- | :--- |
| **Login / Signup** | `POST /api/auth/register`, `POST /api/auth/login` |
| **Menu** | `GET /api/menu` (category, search) through the `useApi` hook |
| **Cart, Order Summary** | Cart in app state. Place Order calls `POST /api/orders` |
| **Order Tracking** | `GET /api/orders/my` every 10 seconds |
| **Reservations** | `POST /api/reservations`, `GET /api/reservations/my` |
| **Manager Dashboard** | Orders, reservations and menu endpoints marked Manager in Section 8 |

---

## 7. Diagrams

### 7.1 Sequence diagram: customer places an order (App, Express Server, MongoDB)

![Figure 2: Place order request, server checks, response and polling](sequence_diagram_A2.png)

*Figure 2: Place order request, server checks, response and polling*

### 7.2 Deployment diagram

![Figure 3: Phones talk over Wi-Fi to the Express server on the laptop, which uses MongoDB](deployment_diagram_A2.png)

*Figure 3: Phones talk over Wi-Fi to the Express server on the laptop, which uses MongoDB*

The A1 class, use case and state machine diagrams stay valid; the order state machine is now enforced by the server.

---

## 8. API Endpoints (new)

| Method | Endpoint | Access | Request body | Response |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/health` | Public | None | 200 { status, time } |
| **POST** | `/api/auth/register` | Public | name, email, password | 201 token and user; 409 if email exists |
| **POST** | `/api/auth/login` | Public | email, password | 200 token and user; 401 if wrong |
| **GET** | `/api/menu` | Public | None (?category=, ?search=) | 200 list of items |
| **GET** | `/api/menu/:id` | Public | None | 200 item; 404 not found; 400 bad id |
| **POST** | `/api/menu` | Manager | name, price, category, description, available | 201 item; 400 bad data |
| **PUT** | `/api/menu/:id` | Manager | fields to update | 200 updated item; 404 |
| **DELETE** | `/api/menu/:id` | Manager | None | 200 message; 404 |
| **POST** | `/api/orders` | Logged in | items: [{ menuItem, quantity }] | 201 order with server total; 400 if unavailable |
| **GET** | `/api/orders/my` | Logged in | None | 200 own orders |
| **GET** | `/api/orders` | Manager | None | 200 all orders |
| **PATCH** | `/api/orders/:id/status` | Manager | status | 200 order; 400 move not allowed |
| **POST** | `/api/reservations` | Logged in | table, date, time, guests | 201 booking; 409 table taken; 400 |
| **GET** | `/api/reservations/my` | Logged in | None | 200 own bookings |
| **GET** | `/api/reservations` | Manager | None | 200 all bookings |
| **PATCH** | `/api/reservations/:id` | Manager | status (Accepted or Declined) | 200 booking |

*Manager = `protect` + `managerOnly`. Logged in = `protect` (header `Authorization: Bearer <token>`).*
