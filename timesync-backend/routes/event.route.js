const express = require("express");
const router = express.Router();
const Event = require("../models/event.model");

// Get all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.findAll({
      where: { userId: req.user.id }
    });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new event
router.post("/", async (req, res) => {
  try {
    // Find the highest existing ID
    const maxEvent = await Event.findOne({
      order: [['id', 'DESC']]
    });
    const nextId = req.body.id || (maxEvent ? maxEvent.id + 1 : 1);

    const event = await Event.create({ 
      id: nextId,
      ...req.body, 
      userId: req.user.id 
    });
    res.status(201).json(event);
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
        userId: req.user.id
      }
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
        userId: req.user.id
      }
    });
    if (!updated) {
      return res.status(404).json({ error: "Event not found" });
    }
    const event = await Event.findByPk(req.params.id);
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
        userId: req.user.id
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
