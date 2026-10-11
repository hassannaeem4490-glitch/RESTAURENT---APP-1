const mongoose = require('mongoose');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

const STATUS_PIPELINE = ['Pending', 'Preparing', 'Ready', 'Served'];

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private (Customer or Manager)
const placeOrder = async (req, res) => {
  try {
    const { items, orderType, table, pickupTime, discountPercent = 0 } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    if (orderType === 'Dine-in' && !table) {
      return res.status(400).json({ message: 'Table number is required for Dine-in orders' });
    }

    if (orderType === 'Takeaway' && !pickupTime) {
      return res.status(400).json({ message: 'Pickup time is required for Takeaway orders' });
    }

    // SECURITY REASON: We NEVER trust the client-submitted prices or totals.
    // A malicious actor or compromised app could alter HTTP payloads to set prices to $0.01.
    // The server must re-fetch every menu item directly from the database, verify that
    // it is in-stock/available, and compute subtotal, tax, service charge, and grand total authoritatively.
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
      let dbItem = null;

      if (item.menuItemId && mongoose.Types.ObjectId.isValid(item.menuItemId)) {
        dbItem = await MenuItem.findById(item.menuItemId);
      } else if (item.name) {
        dbItem = await MenuItem.findOne({ name: item.name });
      }

      if (!dbItem) {
        return res.status(400).json({ message: `Menu item "${item.name || item.menuItemId}" not found in database` });
      }

      if (!dbItem.isAvailable) {
        return res.status(400).json({
          message: `Item "${dbItem.name}" is currently marked unavailable by the kitchen`,
        });
      }

      const itemTotal = dbItem.price * quantity;
      calculatedSubtotal += itemTotal;

      validatedItems.push({
        menuItem: dbItem._id,
        name: dbItem.name,
        price: dbItem.price,
        quantity,
        emoji: dbItem.emoji,
      });
    }

    const serviceCharge = Number((calculatedSubtotal * 0.05).toFixed(2));
    const salesTax = Number((calculatedSubtotal * 0.15).toFixed(2));
    const discountVal = Number(((calculatedSubtotal * (Number(discountPercent) || 0)) / 100).toFixed(2));
    const grandTotal = Number((calculatedSubtotal + serviceCharge + salesTax - discountVal).toFixed(2));

    const newOrder = await Order.create({
      user: req.user._id,
      items: validatedItems,
      subtotal: calculatedSubtotal,
      serviceCharge,
      salesTax,
      discount: discountVal,
      total: grandTotal,
      orderType: orderType || 'Dine-in',
      table: orderType === 'Dine-in' ? table : null,
      pickupTime: orderType === 'Takeaway' ? pickupTime : null,
      status: 'Pending',
    });

    return res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error placing order:', error);
    return res.status(500).json({ message: error.message || 'Server error placing order' });
  }
};

// @desc    Get logged-in customer's own orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    console.error('Error in getMyOrders:', error);
    return res.status(500).json({ message: error.message || 'Server error fetching your orders' });
  }
};

// @desc    Get all orders (manager only)
// @route   GET /api/orders
// @access  Private/Manager
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    console.error('Error in getAllOrders:', error);
    return res.status(500).json({ message: error.message || 'Server error fetching all orders' });
  }
};

// @desc    Update order status (with state-machine progression rules)
// @route   PATCH /api/orders/:id/status
// @access  Private/Manager
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const currentStatus = order.status;
    const targetStatus = status;

    // Rule 1: An order can be Cancelled only while it is Pending
    if (targetStatus === 'Cancelled') {
      if (currentStatus !== 'Pending') {
        return res.status(400).json({
          message: `Cannot cancel an order that is already "${currentStatus}". Only "Pending" orders can be cancelled.`,
        });
      }
      order.status = 'Cancelled';
      const updated = await order.save();
      return res.status(200).json(updated);
    }

    // Rule 2: Cannot change a Cancelled or Served order
    if (currentStatus === 'Cancelled') {
      return res.status(400).json({ message: 'Cannot modify a cancelled order' });
    }
    if (currentStatus === 'Served') {
      return res.status(400).json({ message: 'Order has already been served and closed' });
    }

    // Rule 3: Status can only move forward: Pending -> Preparing -> Ready -> Served
    const currentIndex = STATUS_PIPELINE.indexOf(currentStatus);
    const targetIndex = STATUS_PIPELINE.indexOf(targetStatus);

    if (targetIndex === -1) {
      return res.status(400).json({
        message: `Invalid status "${targetStatus}". Allowed values: ${STATUS_PIPELINE.join(', ')}, Cancelled`,
      });
    }

    if (targetIndex <= currentIndex) {
      return res.status(400).json({
        message: `Invalid status progression: cannot change from "${currentStatus}" back to "${targetStatus}". Status can only move forward.`,
      });
    }

    order.status = targetStatus;
    const updated = await order.save();
    return res.status(200).json(updated);
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    return res.status(500).json({ message: error.message || 'Server error updating order status' });
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
};
