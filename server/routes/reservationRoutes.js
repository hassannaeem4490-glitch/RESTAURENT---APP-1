const express = require('express');
const router = express.Router();
const {
  getTables,
  createReservation,
  getMyReservations,
  getAllReservations,
  updateReservationStatus,
  cancelReservation,
} = require('../controllers/reservationController');
const { protect, managerOnly } = require('../middleware/auth');

router.get('/tables', getTables);
router.post('/', protect, createReservation);
router.get('/my', protect, getMyReservations);
router.get('/', protect, managerOnly, getAllReservations);
router.patch('/:id', protect, managerOnly, updateReservationStatus);
router.patch('/:id/cancel', protect, cancelReservation);

module.exports = router;
