const mongoose = require('mongoose');
const Venue = require('./Venue'); 
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['technical', 'cultural', 'placement', 'workshop', 'sports', 'other'],
      default: 'other',
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    clubOrDept: {
      type: String,
      trim: true,
    },
    confirmedVenue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      default: null, // will be set when admin approves
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
