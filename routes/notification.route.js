const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { Op } = require("sequelize");

// Get all notifications for user
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [['time', 'DESC']]
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new notification
router.post("/", async (req, res) => {
  try {
    const { message, time, type, event_id, task_id } = req.body;
    
    const notificationTime = new Date(time);
    const notification = await Notification.create({
      message,
      time,
      type,
      event_id,
      task_id,
      user_id: req.user.id,
      year: notificationTime.getFullYear(),
      month: notificationTime.getMonth() + 1,
      day: notificationTime.getDate()
    });

    res.status(201).json(notification);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Mark notification as read
router.patch("/:id/read", async (req, res) => {
  try {
    const [updated] = await Notification.update(
      { read_flag: true },
      {
        where: { 
          id: req.params.id,
          user_id: req.user.id
        }
      }
    );
    if (!updated) {
      return res.status(404).json({ error: "Notification not found" });
    }
    const notification = await Notification.findByPk(req.params.id);
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
        user_id: req.user.id
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
