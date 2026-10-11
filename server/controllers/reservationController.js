const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');

// @desc    Get all configured tables
// @route   GET /api/reservations/tables
// @access  Public
const getTables = async (req, res) => {
  try {
    const tables = await Table.find().sort({ seats: 1, tableId: 1 });
    return res.status(200).json(tables);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error fetching tables' });
  }
};

// @desc    Create a new reservation
// @route   POST /api/reservations
// @access  Public / Protected
const createReservation = async (req, res) => {
  try {
    const { contactName, contactPhone, date, timeSlot, partySize, tableId } = req.body;

    if (!contactName || !contactPhone || !date || !timeSlot || !partySize || !tableId) {
      return res.status(400).json({ message: 'All reservation fields are required' });
    }

    const numPartySize = Number(partySize);
    if (isNaN(numPartySize) || numPartySize < 1 || numPartySize > 12) {
      return res.status(400).json({ message: 'Party size must be between 1 and 12' });
    }

    // 1. Verify table exists and has enough capacity
    const table = await Table.findOne({ tableId });
    if (table && table.seats < numPartySize) {
      return res.status(400).json({
        message: `Table ${tableId} only has ${table.seats} seats, but party size is ${numPartySize}`,
      });
    }

    // 2. Check if table is already booked at that date and time (business rule: return 409)
    const conflictingReservation = await Reservation.findOne({
      tableId,
      date,
      timeSlot,
      status: { $in: ['Pending', 'Confirmed'] },
    });

    if (conflictingReservation) {
      return res.status(409).json({
        message: `Table ${tableId} is already booked for ${date} at ${timeSlot}. Please choose another time or table.`,
      });
    }

    const reservation = await Reservation.create({
      user: req.user ? req.user._id : null,
      contactName: contactName.trim(),
      contactPhone: contactPhone.trim(),
      date,
      timeSlot,
      partySize: numPartySize,
      tableId,
      status: 'Pending',
    });

    return res.status(201).json(reservation);
  } catch (error) {
    console.error('Error creating reservation:', error);
    return res.status(500).json({ message: error.message || 'Server error creating reservation' });
  }
};

// @desc    Get customer's reservations
// @route   GET /api/reservations/my
// @access  Private
const getMyReservations = async (req, res) => {
  try {
    let query = {};
    if (req.user) {
      query = {
        $or: [
          { user: req.user._id },
          { contactPhone: req.user.phone || '' },
        ],
      };
    }

    const reservations = await Reservation.find(query).sort({ createdAt: -1 });
    return res.status(200).json(reservations);
  } catch (error) {
    console.error('Error in getMyReservations:', error);
    return res.status(500).json({ message: error.message || 'Server error fetching reservations' });
  }
};

// @desc    Get all reservations (manager only)
// @route   GET /api/reservations
// @access  Private/Manager
const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 });

    return res.status(200).json(reservations);
  } catch (error) {
    console.error('Error in getAllReservations:', error);
    return res.status(500).json({ message: error.message || 'Server error fetching all reservations' });
  }
};

// @desc    Manager updates reservation status (Accept/Decline)
// @route   PATCH /api/reservations/:id
// @access  Private/Manager
const updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid reservation ID format' });
    }

    if (!['Confirmed', 'Declined', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        message: 'Status must be one of: Confirmed, Declined, Cancelled',
      });
    }

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    reservation.status = status;
    const updated = await reservation.save();
    return res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating reservation:', error);
    return res.status(500).json({ message: error.message || 'Server error updating reservation' });
  }
};

// @desc    Customer cancels reservation
// @route   PATCH /api/reservations/:id/cancel
// @access  Private
const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid reservation ID format' });
    }

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    reservation.status = 'Cancelled';
    const updated = await reservation.save();
    return res.status(200).json(updated);
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    return res.status(500).json({ message: error.message || 'Server error cancelling reservation' });
  }
};

module.exports = {
  getTables,
  createReservation,
  getMyReservations,
  getAllReservations,
  updateReservationStatus,
  cancelReservation,
};
