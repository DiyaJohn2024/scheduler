const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String, // classroom, lab, hall, auditorium, meeting_room
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    location: {
      type: String, // e.g. Block A, 3rd floor
      required: true,
    },
    equipment: [
      {
        type: String, // projector, mic, AC, etc.
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Venue', venueSchema);
