const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    tableId: {
      type: String,
      required: [true, 'Table ID is required (e.g., T1, T2)'],
      unique: true,
      trim: true,
    },
    seats: {
      type: Number,
      required: [true, 'Number of seats is required'],
      min: [1, 'Seats must be at least 1'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Table', tableSchema);
