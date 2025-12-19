const express = require('express');
const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const Event = require('../models/Event');
const { authRequired, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/bookings  (club_head, faculty) -> create booking request
router.post(
  '/',
  authRequired,
  requireRole('club_head', 'faculty'),
  async (req, res) => {
    try {
      const { eventId, venueId, startTime, endTime } = req.body;

      if (!eventId || !venueId || !startTime || !endTime) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const start = new Date(startTime);
      const end = new Date(endTime);
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
        return res.status(400).json({ message: 'Invalid start/end time' });
      }

      // Ensure event exists and belongs to this user
      const event = await Event.findOne({
        _id: eventId,
        createdBy: req.user.id,
      });
      if (!event) {
        return res
          .status(404)
          .json({ message: 'Event not found or not owned by you' });
      }

      // Ensure venue exists
      const venue = await Venue.findById(venueId);
      if (!venue || !venue.isActive) {
        return res.status(404).json({ message: 'Venue not found or inactive' });
      }

      // Conflict detection: any Approved booking for same venue overlapping?
      const conflict = await Booking.findOne({
        allocatedVenue: venueId,
        status: 'Approved',
        startTime: { $lt: end },
        endTime: { $gt: start },
      });

      if (conflict) {
        return res.status(409).json({
          message: 'This venue is already booked for the selected time.',
        });
      }

      const booking = await Booking.create({
        event: eventId,
        requestedBy: req.user.id,
        preferredVenue: venueId,
        startTime: start,
        endTime: end,
        status: 'Pending',
      });

      res.status(201).json(booking);
    } catch (err) {
      console.error('Error creating booking:', err.message);
      res.status(500).json({ message: 'Error creating booking' });
    }
  }
);

// GET /api/bookings/mine  (club_head, faculty) -> my booking requests
router.get(
  '/mine',
  authRequired,
  requireRole('club_head', 'faculty'),
  async (req, res) => {
    try {
      const bookings = await Booking.find({ requestedBy: req.user.id })
        .populate('event', 'title startTime endTime')
        .populate('preferredVenue', 'name location')
        .populate('allocatedVenue', 'name location')
        .sort({ createdAt: -1 });

      res.json(bookings);
    } catch (err) {
      console.error('Error fetching my bookings:', err.message);
      res.status(500).json({ message: 'Error fetching my bookings' });
    }
  }
);

// GET /api/bookings/pending  (admin) -> all pending requests
router.get(
  '/pending',
  authRequired,
  requireRole('admin'),
  async (req, res) => {
    try {
      const bookings = await Booking.find({ status: 'Pending' })
        .populate('event', 'title startTime endTime clubOrDept')
        .populate('preferredVenue', 'name location')
        .populate('requestedBy', 'name email role clubOrDept')
        .sort({ createdAt: 1 });

      res.json(bookings);
    } catch (err) {
      console.error('Error fetching pending bookings:', err.message);
      res.status(500).json({ message: 'Error fetching pending bookings' });
    }
  }
);

// PATCH /api/bookings/:id/decision  (admin) -> approve/reject
router.patch(
  '/:id/decision',
  authRequired,
  requireRole('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { decision, allocatedVenueId, adminComment } = req.body;

      if (!['Approved', 'Rejected'].includes(decision)) {
        return res.status(400).json({ message: 'Invalid decision' });
      }

      const booking = await Booking.findById(id).populate('event');
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      if (decision === 'Approved') {
        const venueId = allocatedVenueId || booking.preferredVenue;
        if (!venueId) {
          return res
            .status(400)
            .json({ message: 'No venue specified to approve booking' });
        }

        // Check conflicts again before final approval
        const conflict = await Booking.findOne({
          _id: { $ne: booking._id },
          allocatedVenue: venueId,
          status: 'Approved',
          startTime: { $lt: booking.endTime },
          endTime: { $gt: booking.startTime },
        });

        if (conflict) {
          return res.status(409).json({
            message:
              'This venue is already booked for that time. Cannot approve.',
          });
        }

        booking.status = 'Approved';
        booking.allocatedVenue = venueId;
        booking.adminComment = adminComment || booking.adminComment;

        // also update event.confirmedVenue
        booking.event.confirmedVenue = venueId;
        await booking.event.save();
      } else {
        // Rejected
        booking.status = 'Rejected';
        booking.adminComment = adminComment || booking.adminComment;
      }

      await booking.save();

      res.json(booking);
    } catch (err) {
      console.error('Error updating booking decision:', err.message);
      res.status(500).json({ message: 'Error updating booking decision' });
    }
  }
);


module.exports = router;
