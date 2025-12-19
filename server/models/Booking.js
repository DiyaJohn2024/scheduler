const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // club_head or faculty
      required: true,
    },
    preferredVenue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: false,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    allocatedVenue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      default: null, // set by admin on Approve
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    adminComment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
