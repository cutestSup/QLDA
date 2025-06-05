const express = require('express');
const router = express.Router();
const EventGuest = require('../models/EventGuest');
const Event = require('../models/Event');
const auth = require('../middlewares/auth.middleware');

// Get all guests for an event
router.get('/events/:eventId/guests', auth, async (req, res) => {
    try {
        // Verify event ownership
        const event = await Event.findOne({
            where: {
                id: req.params.eventId,
                userId: req.user.id
            }
        });

        if (!event) {
            return res.status(404).json({ error: 'Event not found or access denied' });
        }

        const guests = await EventGuest.findAll({
            where: {
                eventId: req.params.eventId
            }
        });

        res.json(guests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update guest response
router.patch('/events/:eventId/guests/:guestId', auth, async (req, res) => {
    try {
        const { response, comment } = req.body;

        // Verify event ownership or guest authorization
        const guest = await EventGuest.findOne({
            where: {
                id: req.params.guestId,
                eventId: req.params.eventId
            },
            include: [{
                model: Event,
                where: { userId: req.user.id }
            }]
        });

        if (!guest) {
            return res.status(404).json({ error: 'Guest not found or access denied' });
        }

        // Update guest response
        await guest.update({
            response,
            comment,
            updatedAt: new Date()
        });

        res.json(guest);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add guest to event
router.post('/events/:eventId/guests', auth, async (req, res) => {
    try {
        const { email, optional } = req.body;

        // Verify event ownership
        const event = await Event.findOne({
            where: {
                id: req.params.eventId,
                userId: req.user.id
            }
        });

        if (!event) {
            return res.status(404).json({ error: 'Event not found or access denied' });
        }

        // Create new guest
        const guest = await EventGuest.create({
            eventId: req.params.eventId,
            email,
            optional
        });

        res.status(201).json(guest);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Remove guest from event
router.delete('/events/:eventId/guests/:guestId', auth, async (req, res) => {
    try {
        // Verify event ownership
        const event = await Event.findOne({
            where: {
                id: req.params.eventId,
                userId: req.user.id
            }
        });

        if (!event) {
            return res.status(404).json({ error: 'Event not found or access denied' });
        }

        // Delete guest
        await EventGuest.destroy({
            where: {
                id: req.params.guestId,
                eventId: req.params.eventId
            }
        });

        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
