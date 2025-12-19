const express = require('express');
const Event = require('../models/Event');
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
      const {
        title,
        description,
        type,
        startTime,
        endTime,
        clubOrDept,
      } = req.body;

      const event = await Event.create({
        title,
        description,
        type,
        startTime,
        endTime,
        createdBy: req.user.id,        // from JWT
        clubOrDept: clubOrDept || req.user.clubOrDept, // optional
      });

      res.status(201).json(event);
    } catch (err) {
      console.error('Error creating event:', err.message);
      res.status(500).json({ message: 'Error creating event' });
    }
  }
);

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

module.exports = router;
