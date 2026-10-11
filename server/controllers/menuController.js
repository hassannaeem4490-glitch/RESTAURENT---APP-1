const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');

// @desc    Get all menu items (with category & search filtering)
// @route   GET /api/menu
// @access  Public
const getMenuItems = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    const items = await MenuItem.find(query).sort({ category: 1, name: 1 });
    return res.status(200).json(items);
  } catch (error) {
    console.error('Error in getMenuItems:', error);
    return res.status(500).json({ message: error.message || 'Server error fetching menu items' });
  }
};

// @desc    Get single menu item by ID
// @route   GET /api/menu/:id
// @access  Public
const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid menu item ID format' });
    }

    const item = await MenuItem.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    return res.status(200).json(item);
  } catch (error) {
    console.error('Error in getMenuItemById:', error);
    return res.status(500).json({ message: error.message || 'Server error fetching menu item' });
  }
};

// @desc    Create new menu item
// @route   POST /api/menu
// @access  Private/Manager
const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, emoji, isSpecial, isAvailable } = req.body;

    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({ message: 'Name, description, price, and category are required' });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ message: 'Price cannot be negative' });
    }

    const existing = await MenuItem.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: 'A menu item with this name already exists' });
    }

    const newItem = await MenuItem.create({
      name: name.trim(),
      description: description.trim(),
      price: numPrice,
      category,
      emoji: emoji || '🍽️',
      isSpecial: Boolean(isSpecial),
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
    });

    return res.status(201).json(newItem);
  } catch (error) {
    console.error('Error in createMenuItem:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message || 'Server error creating menu item' });
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private/Manager
const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid menu item ID format' });
    }

    const item = await MenuItem.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    const { name, description, price, category, emoji, isSpecial, isAvailable } = req.body;

    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0) {
        return res.status(400).json({ message: 'Price cannot be negative' });
      }
      item.price = numPrice;
    }

    if (name) item.name = name.trim();
    if (description) item.description = description.trim();
    if (category) item.category = category;
    if (emoji) item.emoji = emoji;
    if (isSpecial !== undefined) item.isSpecial = Boolean(isSpecial);
    if (isAvailable !== undefined) item.isAvailable = Boolean(isAvailable);

    const updatedItem = await item.save();
    return res.status(200).json(updatedItem);
  } catch (error) {
    console.error('Error in updateMenuItem:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message || 'Server error updating menu item' });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private/Manager
const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid menu item ID format' });
    }

    const item = await MenuItem.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    await item.deleteOne();
    return res.status(200).json({ message: 'Menu item deleted successfully', id });
  } catch (error) {
    console.error('Error in deleteMenuItem:', error);
    return res.status(500).json({ message: error.message || 'Server error deleting menu item' });
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
