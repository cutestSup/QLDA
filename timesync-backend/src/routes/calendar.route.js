const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const Event = require("../models/event.model");
const Task = require("../models/task.model");
const Notification = require("../models/notification.model");

// Group items by date
const groupByDate = (items) => {
  const grouped = {};
  items.forEach(item => {
    // Get date string (YYYY-MM-DD) from timestamp
    const date = new Date(item.startTime || item.dueDate || item.time)
      .toISOString().split('T')[0];
    
    if (!grouped[date]) {
      grouped[date] = {
        date,
        events: [],
        tasks: [],
        notifications: []
      };
    }

    if ('startTime' in item) grouped[date].events.push(item);
    else if ('dueDate' in item) grouped[date].tasks.push(item);
    else if ('time' in item) grouped[date].notifications.push(item);
  });

  // Convert to array and sort by date
  return Object.values(grouped).sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );
};

// Unified calendar view (day/week/month/agenda)
router.get("/view", async (req, res) => {
  const { type = "week", start, grouped = false } = req.query;

  if (!start) {
    return res.status(400).json({ error: "Missing 'start' query param" });
  }

  const startDate = new Date(start);
  let endDate = new Date(startDate);

  switch (type.toLowerCase()) {
    case "day":
      endDate.setDate(endDate.getDate() + 1);
      break;
    case "week":
      endDate.setDate(endDate.getDate() + 7);
      break;
    case "month":
      endDate.setMonth(endDate.getMonth() + 1);
      break;
    case "agenda": // Agenda view - show next 30 days by default
      endDate.setDate(endDate.getDate() + 30);
      break;
    default:
      return res.status(400).json({ error: "Invalid type: should be day, week, month or agenda" });
  }

  try {
    const [events, tasks, notifications] = await Promise.all([
      Event.findAll({
        where: {
          userId: req.user.id,
          startTime: { [Op.gte]: startDate },
          endTime: { [Op.lte]: endDate }
        },
        order: [['startTime', 'ASC']]
      }),
      Task.findAll({
        where: {
          userId: req.user.id,
          dueDate: { [Op.between]: [startDate, endDate] }
        },
        order: [['dueDate', 'ASC']]
      }),
      Notification.findAll({
        where: {
          userId: req.user.id,
          time: { [Op.between]: [startDate, endDate] }
        },
        order: [['time', 'ASC']]
      })
    ]);

    // If grouped=true, group items by date
    const response = grouped ? 
      groupByDate([...events, ...tasks, ...notifications]) :
      {
        start: startDate,
        end: endDate,
        events,
        tasks,
        notifications
      };

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
