// src/data/users.js
// Mock user "database" used by AuthContext for login/signup simulation.

export const users = [
  {
    id: 'u1',
    fullName: 'Ayesha Khan',
    email: 'customer@test.com',
    password: 'Pass1234',
    role: 'customer',
  },
  {
    id: 'u2',
    fullName: 'Hassan Naeem',
    email: 'manager@test.com',
    password: 'Manager123',
    role: 'manager',
  },
];

// Simple helper so AuthContext doesn't need to know the array shape.
export function findUserByCredentials(email, password) {
  return users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
}

export function emailExists(email) {
  return users.some((u) => u.email.toLowerCase() === email.toLowerCase());
}
