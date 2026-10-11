const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    contactName: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true,
    },
    contactPhone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Reservation date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
    },
    partySize: {
      type: Number,
      required: [true, 'Party size is required'],
      min: [1, 'Party size must be at least 1'],
      max: [12, 'Party size cannot exceed 12'],
    },
    tableId: {
      type: String,
      required: [true, 'Table ID is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Confirmed', 'Declined', 'Cancelled'],
        message: '{VALUE} is not a valid reservation status',
      },
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reservation', reservationSchema);
