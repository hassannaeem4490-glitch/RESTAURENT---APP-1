// src/data/menu.js
export const initialMenu = [
  { id: 1, name: 'Margherita Pizza', description: 'Classic tomato, mozzarella, basil.', price: 12, category: 'Mains', emoji: '🍕', isSpecial: true, isAvailable: true },
  { id: 2, name: 'Veg Burger', description: 'Grilled patty, lettuce, house sauce.', price: 8, category: 'Mains', emoji: '🍔', isSpecial: false, isAvailable: true },
  { id: 3, name: 'Pasta Alfredo', description: 'Creamy parmesan sauce, fettuccine.', price: 10, category: 'Mains', emoji: '🍝', isSpecial: false, isAvailable: true },
  { id: 4, name: 'Chicken Steak', description: 'Grilled chicken breast, pepper sauce.', price: 14, category: 'Mains', emoji: '🍗', isSpecial: false, isAvailable: true },
  { id: 5, name: 'Beef Lasagna', description: 'Layered pasta, beef ragu, cheese.', price: 13, category: 'Mains', emoji: '🍲', isSpecial: false, isAvailable: false },
  { id: 6, name: 'Spring Rolls', description: 'Crispy vegetable rolls, sweet chili dip.', price: 6, category: 'Starters', emoji: '🥟', isSpecial: false, isAvailable: true },
  { id: 7, name: 'Chicken Wings', description: 'Spicy buffalo wings, six pieces.', price: 7, category: 'Starters', emoji: '🍖', isSpecial: true, isAvailable: true },
  { id: 8, name: 'Nachos Supreme', description: 'Loaded nachos, cheese, jalapenos.', price: 7.5, category: 'Starters', emoji: '🧀', isSpecial: false, isAvailable: true },
  { id: 9, name: 'Soup of the Day', description: "Chef's daily selection, served warm.", price: 5, category: 'Starters', emoji: '🍜', isSpecial: false, isAvailable: true },
  { id: 10, name: 'Chocolate Lava Cake', description: 'Warm molten center, vanilla ice cream.', price: 6, category: 'Desserts', emoji: '🍫', isSpecial: true, isAvailable: true },
  { id: 11, name: 'Cheesecake', description: 'New York style, berry compote.', price: 5.5, category: 'Desserts', emoji: '🍰', isSpecial: false, isAvailable: true },
  { id: 12, name: 'Ice Cream Sundae', description: 'Three scoops, chocolate syrup, nuts.', price: 4.5, category: 'Desserts', emoji: '🍨', isSpecial: false, isAvailable: true },
  { id: 13, name: 'Fresh Lemonade', description: 'Chilled, mint garnish.', price: 3, category: 'Drinks', emoji: '🍋', isSpecial: false, isAvailable: true },
  { id: 14, name: 'Iced Coffee', description: 'Cold brew, milk, ice.', price: 3.5, category: 'Drinks', emoji: '🥤', isSpecial: false, isAvailable: true },
  { id: 15, name: 'Mango Smoothie', description: 'Fresh mango, yogurt blend.', price: 4, category: 'Drinks', emoji: '🥭', isSpecial: true, isAvailable: true },
  { id: 16, name: 'Soft Drink', description: 'Choice of cola, lemon-lime, or orange.', price: 2, category: 'Drinks', emoji: '🥤', isSpecial: false, isAvailable: true },
];

export const categories = ['Starters', 'Mains', 'Desserts', 'Drinks'];
