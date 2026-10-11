const mongoose = require('mongoose');
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const Table = require('./models/Table');
const Reservation = require('./models/Reservation');
const Order = require('./models/Order');

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

const seedData = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/restaurant_app';
  console.log(`Connecting to MongoDB at: ${mongoUri}`);

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected for seeding.');

    // 1. Clear existing collections
    console.log('Clearing existing collections...');
    await User.deleteMany();
    await MenuItem.deleteMany();
    await Table.deleteMany();
    await Reservation.deleteMany();
    await Order.deleteMany();

    // 2. Hash passwords and insert users
    console.log('Seeding users with hashed passwords...');
    const salt = await bcrypt.genSalt(10);
    const customerPassword = await bcrypt.hash('Pass1234', salt);
    const managerPassword = await bcrypt.hash('Manager123', salt);

    const seededUsers = await User.insertMany([
      {
        fullName: 'Ayesha Khan',
        email: 'customer@test.com',
        password: customerPassword,
        role: 'customer',
      },
      {
        fullName: 'Hassan Naeem',
        email: 'manager@test.com',
        password: managerPassword,
        role: 'manager',
      },
    ]);
    console.log(`Seeded ${seededUsers.length} users successfully.`);

    // 3. Insert menu items
    console.log('Seeding menu items...');
    const seededMenu = await MenuItem.insertMany(initialMenu);
    console.log(`Seeded ${seededMenu.length} menu items successfully.`);

    // 4. Insert tables
    console.log('Seeding restaurant tables...');
    const seededTables = await Table.insertMany(mockTables);
    console.log(`Seeded ${seededTables.length} tables successfully.`);

    console.log('\n========================================');
    console.log('Database Seeding Completed Successfully!');
    console.log('Seeded Users:');
    console.log(' - Customer: customer@test.com / Pass1234');
    console.log(' - Manager:  manager@test.com  / Manager123');
    console.log(`Seeded Menu Items: ${seededMenu.length}`);
    console.log(`Seeded Tables: ${seededTables.length}`);
    console.log('========================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n============================================================');
    console.error('❌ MONGODB CONNECTION ERROR DURING SEEDING:');
    console.error(`   ${error.message}`);
    console.error('------------------------------------------------------------');
    console.error('💡 To seed the database:');
    console.error('   1. Ensure MongoDB is running locally, OR');
    console.error('   2. Set your free MongoDB Atlas URI in `server/.env`:');
    console.error('      MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/restaurant_app');
    console.error('============================================================\n');
    process.exit(1);
  }
};

seedData();
