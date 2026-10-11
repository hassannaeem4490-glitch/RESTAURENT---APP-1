const bcrypt = require('bcryptjs');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');

const initialMenu = [
  { name: 'Margherita Pizza', description: 'Classic tomato, mozzarella, basil.', price: 12, category: 'Mains', emoji: '🍕', isSpecial: true, isAvailable: true },
  { name: 'Veg Burger', description: 'Grilled patty, lettuce, house sauce.', price: 8, category: 'Mains', emoji: '🍔', isSpecial: false, isAvailable: true },
  { name: 'alferedo pasta', description: 'Creamy parmesan sauce, fettuccine.', price: 10, category: 'Mains', emoji: '🍝', isSpecial: false, isAvailable: true },
  { name: 'Chicken Steak', description: 'Grilled chicken breast, pepper sauce.', price: 14, category: 'Mains', emoji: '🍗', isSpecial: false, isAvailable: true },
  { name: 'Beef Lasagna', description: 'Layered pasta, beef ragu, cheese.', price: 13, category: 'Mains', emoji: '🍲', isSpecial: false, isAvailable: false },
  { name: 'Spring Rolls', description: 'Crispy vegetable rolls, sweet chili dip.', price: 6, category: 'Starters', emoji: '🥟', isSpecial: false, isAvailable: true },
  { name: 'Chicken Wings', description: 'Spicy buffalo wings, six pieces.', price: 7, category: 'Starters', emoji: '🍖', isSpecial: true, isAvailable: true },
  { name: 'Nachos Supreme', description: 'Loaded nachos, cheese, jalapenos.', price: 7.5, category: 'Starters', emoji: '🧀', isSpecial: false, isAvailable: true },
  { name: 'Soup of the Day', description: "Chef's daily selection, served warm.", price: 5, category: 'Starters', emoji: '🍜', isSpecial: false, isAvailable: true },
  { name: 'Chocolate Lava Cake', description: 'Warm molten center, vanilla ice cream.', price: 6, category: 'Desserts', emoji: '🍫', isSpecial: true, isAvailable: true },
  { name: 'Cheesecake', description: 'New York style, berry compote.', price: 5.5, category: 'Desserts', emoji: '🍰', isSpecial: false, isAvailable: true },
  { name: 'Ice Cream Sundae', description: 'Three scoops, chocolate syrup, nuts.', price: 4.5, category: 'Desserts', emoji: '🍨', isSpecial: false, isAvailable: true },
  { name: 'Fresh Lemonade', description: 'Chilled, mint garnish.', price: 3, category: 'Drinks', emoji: '🍋', isSpecial: false, isAvailable: true },
  { name: 'Iced Coffee', description: 'Cold brew, milk, ice.', price: 3.5, category: 'Drinks', emoji: '🥤', isSpecial: false, isAvailable: true },
  { name: 'Mango Smoothie', description: 'Fresh mango, yogurt blend.', price: 4, category: 'Drinks', emoji: '🥭', isSpecial: true, isAvailable: true },
  { name: 'Soft Drink', description: 'Choice of cola, lemon-lime, or orange.', price: 2, category: 'Drinks', emoji: '🥤', isSpecial: false, isAvailable: true },
];

const mockTables = [
  { tableId: 'T1', seats: 2 },
  { tableId: 'T2', seats: 2 },
  { tableId: 'T3', seats: 4 },
  { tableId: 'T4', seats: 4 },
  { tableId: 'T5', seats: 4 },
  { tableId: 'T6', seats: 6 },
  { tableId: 'T7', seats: 6 },
  { tableId: 'T8', seats: 8 },
];

async function autoSeedIfEmpty() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database empty. Auto-seeding initial users, menu, and tables...');
      const salt = await bcrypt.genSalt(10);
      const customerPassword = await bcrypt.hash('Pass1234', salt);
      const managerPassword = await bcrypt.hash('Manager123', salt);

      await User.insertMany([
        { fullName: 'Ayesha Khan', email: 'customer@test.com', password: customerPassword, role: 'customer' },
        { fullName: 'Hassan Naeem', email: 'manager@test.com', password: managerPassword, role: 'manager' },
      ]);
      await MenuItem.insertMany(initialMenu);
      await Table.insertMany(mockTables);
      console.log('Auto-seeding completed successfully!');
    }
  } catch (err) {
    console.warn('Auto-seed warning:', err.message);
  }
}

module.exports = { autoSeedIfEmpty };
