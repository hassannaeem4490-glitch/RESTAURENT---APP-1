const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, managerOnly } = require('../middleware/auth');

router.post('/', protect, placeOrder);
router.get('/my', protect, getMyOrders);
router.get('/', protect, managerOnly, getAllOrders);
router.patch('/:id/status', protect, managerOnly, updateOrderStatus);

module.exports = router;
