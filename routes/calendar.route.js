const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const moment = require("moment-timezone");
const { RRule } = require("rrule");
const crypto = require("crypto");
const Event = require("../models/Event");
const EventGuest = require("../models/EventGuest");
const Calendar = require("../models/Calendar");
const Task = require("../models/Task");
const Notification = require("../models/Notification");

// Helper function to expand recurring events
const expandRecurringEvents = (event, start, end) => {
  if (!event.is_recurring || !event.recurrence_rule) {
    return [event];
  }

  const rrule = RRule.fromString(event.recurrence_rule);
  const dates = rrule.between(new Date(start), new Date(end));
  
  return dates.map(date => ({
    ...event.toJSON(),
    start_time: moment(date).format(),
    end_time: moment(date)
      .add(moment(event.end_time).diff(moment(event.start_time)))
      .format(),
    isRecurrence: true,
    originalEventId: event.id
  }));
};

// Get user's calendars
router.get("/calendars", async (req, res) => {
  try {
    const calendars = await Calendar.findAll({
      where: { owner_id: req.user.id }
    });
    res.json(calendars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new calendar
router.post("/calendars", async (req, res) => {
  try {
    const calendar = await Calendar.create({
      ...req.body,
      owner_id: req.user.id
    });
    res.status(201).json(calendar);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Unified calendar view (day/week/month/agenda)
router.get("/view", async (req, res) => {
  const { 
    type = "week",
    start,
    end,
    calendars,
    timezone = "UTC",
    expandRecurring = true
  } = req.query;

  if (!start) {
    return res.status(400).json({ error: "Missing 'start' parameter" });
  }

  const startDate = moment.tz(start, timezone).startOf(type);
  const endDate = end ? 
    moment.tz(end, timezone) :
    moment(startDate).endOf(type);

  // Calculate time range based on view type if end not provided
  if (!end) {
    switch (type) {
      case "day":
        endDate.add(1, 'day');
        break;
      case "week":
        endDate.add(1, 'week');
        break;
      case "month":
        endDate.add(1, 'month');
        break;
      case "agenda":
        endDate.add(30, 'days');
        break;
    }
  }

  try {
    // Build calendar filter
    const calendarFilter = calendars ? 
      { calendar_id: { [Op.in]: calendars.split(',') } } :
      {};

    // Get all calendar items
    const [events, tasks, notifications] = await Promise.all([
      Event.findAll({
        where: {
          owner_id: req.user.id,
          ...calendarFilter,
          [Op.or]: [
            // One-time events
            {
              is_recurring: false,
              start_time: { [Op.between]: [startDate, endDate] }
            },
            // Recurring events
            {
              is_recurring: true,
              start_time: { [Op.lte]: endDate }
            }
          ]
        },
        include: [
          { 
            model: EventGuest,
            attributes: ['email', 'response_status', 'optional']
          }
        ],
        order: [['start_time', 'ASC']]
      }),
      Task.findAll({
        where: {
          user_id: req.user.id,
          due_date: { [Op.between]: [startDate, endDate] }
        },
        order: [['due_date', 'ASC']]
      }),
      Notification.findAll({
        where: {
          user_id: req.user.id,
          time: { [Op.between]: [startDate, endDate] }
        },
        order: [['time', 'ASC']]
      })
    ]);

    // Expand recurring events if requested
    let processedEvents = events;
    if (expandRecurring) {
      processedEvents = events.reduce((acc, event) => [
        ...acc,
        ...expandRecurringEvents(event, startDate, endDate)
      ], []);
    }

    // Format response based on preference (grouped or flat)
    const response = req.query.grouped ?
      groupByDate([...processedEvents, ...tasks, ...notifications], timezone) :
      {
        range: {
          start: startDate,
          end: endDate,
          timezone
        },
        events: processedEvents,
        tasks,
        notifications
      };

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Group items by date
const groupByDate = (items, timezone) => {
  const grouped = {};
  
  items.forEach(item => {
    // Get date string (YYYY-MM-DD) from relevant timestamp
    const date = moment.tz(
      item.start_time || item.due_date || item.time,
      timezone
    ).format('YYYY-MM-DD');
    
    if (!grouped[date]) {
      grouped[date] = {
        date,
        events: [],
        tasks: [],
        notifications: []
      };
    }

    if ('start_time' in item) grouped[date].events.push(item);
    else if ('due_date' in item) grouped[date].tasks.push(item);
    else if ('time' in item) grouped[date].notifications.push(item);
  });

  // Convert to array and sort by date
  return Object.values(grouped).sort((a, b) => 
    moment(a.date).diff(moment(b.date))
  );
};

// Get event guests
router.get("/events/:id/guests", async (req, res) => {
  try {
    const guests = await EventGuest.findAll({
      where: { event_id: req.params.id }
    });
    res.json(guests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update guest response
router.patch("/events/:eventId/guests/:guestId", async (req, res) => {
  try {
    const [updated] = await EventGuest.update(
      { 
        response_status: req.body.response,
        response_time: new Date(),
        comment: req.body.comment
      },
      { 
        where: { 
          id: req.params.guestId,
          event_id: req.params.eventId
        }
      }
    );

    if (!updated) {
      return res.status(404).json({ error: "Guest not found" });
    }

    const guest = await EventGuest.findByPk(req.params.guestId);
    res.json(guest);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get free/busy information
router.get("/freebusy", async (req, res) => {
  try {
    const { start, end, calendars } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ error: "Missing start or end time" });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    // Get events from specified calendars or all user's calendars
    const calendarIds = calendars ? calendars.split(',').map(id => parseInt(id)) : null;
    
    const events = await Event.findAll({
      where: {
        calendarId: calendarIds ? { [Op.in]: calendarIds } : { [Op.ne]: null },
        userId: req.user.id,
        startTime: { [Op.lt]: endDate },
        endTime: { [Op.gt]: startDate }
      },
      attributes: ['id', 'startTime', 'endTime', 'busy_status']
    });

    // Format response
    const busyPeriods = events
      .filter(event => event.busy_status !== 'free')
      .map(event => ({
        start: event.startTime,
        end: event.endTime
      }));

    res.json({
      timeMin: startDate,
      timeMax: endDate,
      calendars: calendarIds,
      busy: busyPeriods
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get sync token for a calendar
router.get("/:id/sync", async (req, res) => {
  try {
    const calendar = await Calendar.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!calendar) {
      return res.status(404).json({ error: "Calendar not found" });
    }

    // Generate new sync token
    const syncToken = crypto.randomBytes(16).toString('hex');

    // Store the current timestamp with the token
    await calendar.update({
      syncToken,
      lastSyncTime: new Date()
    });

    res.json({ syncToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get calendar changes since last sync
router.get("/:id/changes", async (req, res) => {
  try {
    const { syncToken } = req.query;
    
    if (!syncToken) {
      return res.status(400).json({ error: "Missing sync token" });
    }

    const calendar = await Calendar.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
        syncToken
      }
    });

    if (!calendar) {
      return res.status(404).json({ error: "Calendar not found or invalid sync token" });
    }

    // Get all changes since last sync
    const lastSync = calendar.lastSyncTime;
    
    const [created, updated, deleted] = await Promise.all([
      // Get new events
      Event.findAll({
        where: {
          calendarId: calendar.id,
          createdAt: { [Op.gt]: lastSync }
        }
      }),
      // Get updated events
      Event.findAll({
        where: {
          calendarId: calendar.id,
          updatedAt: { [Op.gt]: lastSync },
          createdAt: { [Op.lte]: lastSync }
        }
      }),
      // Get deleted event IDs from audit log
      // Note: You'll need to implement event deletion tracking
      []
    ]);

    // Generate new sync token
    const newSyncToken = crypto.randomBytes(16).toString('hex');
    
    await calendar.update({
      syncToken: newSyncToken,
      lastSyncTime: new Date()
    });

    res.json({
      nextSyncToken: newSyncToken,
      changes: {
        created,
        updated,
        deleted
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;