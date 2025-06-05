const express = require("express");
const router = express.Router();
const Notification = require("../models/notification.model");
const Event = require("../models/event.model");
const Task = require("../models/task.model");

// Get all notifications
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      include: [
        { model: Event, as: 'event' },
        { model: Task, as: 'task' }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new notification
router.post("/", async (req, res) => {
  try {
    // Find the highest existing ID
    const maxNotification = await Notification.findOne({
      order: [['id', 'DESC']]
    });
    const nextId = req.body.id || (maxNotification ? maxNotification.id + 1 : 1);

    const notification = await Notification.create({ 
      id: nextId,
      ...req.body, 
      userId: req.user.id 
    });
    res.status(201).json(notification);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Mark notification as read
router.put("/:id/read", async (req, res) => {
  try {
    const [updated] = await Notification.update(
      { read: true },
      {
        where: { 
          id: req.params.id,
          userId: req.user.id
        }
      }
    );
    if (!updated) {
      return res.status(404).json({ error: "Notification not found" });
    }
    const notification = await Notification.findByPk(req.params.id, {
      include: [
        { model: Event, as: 'event' },
        { model: Task, as: 'task' }
      ]
    });
    res.json(notification);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete notification
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Notification.destroy({
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });
    if (!deleted) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
