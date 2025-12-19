const express = require('express');
const Venue = require('../models/Venue');
const { authRequired, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/venues  (public - to show in dropdowns, filters, etc.)
router.get('/', async (req, res) => {
  try {
    const venues = await Venue.find({ isActive: true }).sort({ name: 1 });
    res.json(venues);
  } catch (err) {
    console.error('Error fetching venues:', err.message);
    res.status(500).json({ message: 'Error fetching venues' });
  }
});

// POST /api/venues  (admin only - create venue)
router.post(
  '/',
  authRequired,
  requireRole('admin'),
  async (req, res) => {
    try {
      const { name, type, capacity, location, equipment } = req.body;

      const existing = await Venue.findOne({ name });
      if (existing) {
        return res.status(400).json({ message: 'Venue with this name already exists' });
      }

      const venue = await Venue.create({
        name,
        type,
        capacity,
        location,
        equipment: equipment || [],
      });

      res.status(201).json(venue);
    } catch (err) {
      console.error('Error creating venue:', err.message);
      res.status(500).json({ message: 'Error creating venue' });
    }
  }
);

module.exports = router;
