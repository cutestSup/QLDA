const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const Attendee = require("../models/Attendee");
const { Op } = require("sequelize");

// Get all events or filter by date
router.get("/", async (req, res) => {
  try {
    const where = { owner_id: req.user.id };
    const filters = req.query;

    if (filters.year) where.year = parseInt(filters.year);
    if (filters.month) where.month = parseInt(filters.month);
    if (filters.day) where.day = parseInt(filters.day);

    const events = await Event.findAll({
      where,
      include: [{ model: Attendee }],
      order: [['start_time', 'ASC']]
    });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new event
router.post("/", async (req, res) => {
  try {
    const { title, description, location, start_time, end_time, attendees = [] } = req.body;
    
    const startTime = new Date(start_time);
    const event = await Event.create({
      title,
      description,
      location,
      start_time,
      end_time,
      owner_id: req.user.id,
      year: startTime.getFullYear(),
      month: startTime.getMonth() + 1,
      day: startTime.getDate()
    });

    if (attendees.length > 0) {
      const attendeeRecords = attendees.map(email => ({
        event_id: event.id,
        user_email: email
      }));
      await Attendee.bulkCreate(attendeeRecords);
    }

    const eventWithAttendees = await Event.findByPk(event.id, {
      include: [{ model: Attendee }]
    });
    res.status(201).json(eventWithAttendees);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get event by ID
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findOne({
      where: { 
        id: req.params.id,
        owner_id: req.user.id
      },
      include: [{ model: Attendee }]
    });
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update event
router.put("/:id", async (req, res) => {
  try {
    const [updated] = await Event.update(req.body, {
      where: { 
        id: req.params.id,
        owner_id: req.user.id
      }
    });
    if (!updated) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Update attendees if provided
    if (req.body.attendees) {
      await Attendee.destroy({ where: { event_id: req.params.id } });
      const attendeeRecords = req.body.attendees.map(email => ({
        event_id: req.params.id,
        user_email: email
      }));
      await Attendee.bulkCreate(attendeeRecords);
    }

    const event = await Event.findByPk(req.params.id, {
      include: [{ model: Attendee }]
    });
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete event
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Event.destroy({
      where: { 
        id: req.params.id,
        owner_id: req.user.id
      }
    });
    if (!deleted) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
