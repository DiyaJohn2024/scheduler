const express = require('express');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const { authRequired, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/events (public)
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const query = {};
    if (type) query.type = type;

    const events = await Event.find(query)
      .populate('confirmedVenue', 'name location')
      .populate('createdBy', 'name role clubOrDept')
      .sort({ startTime: 1 });

    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err.message);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// POST /api/events (protected: club_head, faculty)
router.post(
  '/',
  authRequired,
  requireRole('club_head', 'faculty'),
  async (req, res) => {
    try {
      const { title, description, type, startTime, endTime, clubOrDept } = req.body;

      const event = await Event.create({
        title,
        description,
        type,
        startTime,
        endTime,
        createdBy: req.user.id,        // from JWT
        clubOrDept: clubOrDept || req.user.clubOrDept,
      });

      res.status(201).json(event);
    } catch (err) {
      console.error('Error creating event:', err.message);
      res.status(500).json({ message: 'Error creating event' });
    }
  }
);

// GET /api/events/mine (protected)
router.get(
  '/mine',
  authRequired,
  requireRole('club_head', 'faculty', 'admin'),
  async (req, res) => {
    try {
      const events = await Event.find({ createdBy: req.user.id })
        .populate('confirmedVenue', 'name location')
        .sort({ startTime: 1 });

      res.json(events);
    } catch (err) {
      console.error('Error fetching my events:', err.message);
      res.status(500).json({ message: 'Error fetching my events' });
    }
  }
);

// GET /api/events/:id (protected)
router.get(
  '/:id',
  authRequired,
  requireRole('club_head', 'faculty', 'admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const query =
        req.user.role === 'admin'
          ? { _id: id }
          : { _id: id, createdBy: req.user.id };

      const event = await Event.findOne(query).populate('confirmedVenue', 'name location');
      if (!event) {
        return res.status(404).json({ message: 'Event not found or not yours' });
      }
      res.json(event);
    } catch (err) {
      console.error('Error fetching event by id:', err.message);
      res.status(500).json({ message: 'Error loading event' });
    }
  }
);

// PATCH /api/events/:id (protected)
router.patch(
  '/:id',
  authRequired,
  requireRole('club_head', 'faculty', 'admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, type, startTime, endTime } = req.body;

      const query =
        req.user.role === 'admin'
          ? { _id: id }
          : { _id: id, createdBy: req.user.id };

      const event = await Event.findOne(query);
      if (!event) {
        return res.status(404).json({ message: 'Event not found or not yours' });
      }

      if ((startTime || endTime) && event._id) {
        const hasApprovedBooking = await Booking.findOne({
          event: event._id,
          status: 'Approved',
        });
        if (hasApprovedBooking) {
          return res.status(400).json({
            message:
              'Cannot change time of an event that has an approved booking. Edit/cancel booking first.',
          });
        }
      }

      if (title !== undefined) event.title = title;
      if (description !== undefined) event.description = description;
      if (type !== undefined) event.type = type;
      if (startTime !== undefined) event.startTime = startTime;
      if (endTime !== undefined) event.endTime = endTime;

      await event.save();
      res.json(event);
    } catch (err) {
      console.error('Error updating event:', err.message);
      res.status(500).json({ message: 'Error updating event' });
    }
  }
);

// DELETE /api/events/:id (protected)
router.delete(
  '/:id',
  authRequired,
  requireRole('club_head', 'faculty', 'admin'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const query =
        req.user.role === 'admin'
          ? { _id: id }
          : { _id: id, createdBy: req.user.id };

      const event = await Event.findOne(query);
      if (!event) {
        return res.status(404).json({ message: 'Event not found or not yours' });
      }

      const approvedBooking = await Booking.findOne({
        event: event._id,
        status: 'Approved',
      });
      if (approvedBooking) {
        return res.status(400).json({
          message:
            'Cannot delete event with an approved booking. Ask admin to cancel booking first.',
        });
      }

      await Booking.deleteMany({ event: event._id });
      await Event.deleteOne({ _id: event._id });

      res.json({ message: 'Event and related bookings deleted' });
    } catch (err) {
      console.error('Error deleting event:', err.message);
      res.status(500).json({ message: 'Error deleting event' });
    }
  }
);

module.exports = router;
