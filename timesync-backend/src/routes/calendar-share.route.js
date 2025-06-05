const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const crypto = require("crypto");
const Calendar = require("../models/Calendar");
const CalendarShare = require("../models/CalendarShare");
const Event = require("../models/Event");
const User = require("../models/User");
const authMiddleware = require("../middlewares/auth.middleware");

// Helper to check calendar access
const checkCalendarAccess = async (calendarId, userId, requiredRole = 'reader') => {
  const calendar = await Calendar.findByPk(calendarId);
  
  if (!calendar) {
    throw new Error("Calendar not found");
  }

  // Owner has full access
  if (calendar.owner_id === userId) {
    return true;
  }

  // Check shared access
  const share = await CalendarShare.findOne({
    where: {
      calendar_id: calendarId,
      shared_with_id: userId,
      status: 'accepted'
    }
  });

  if (!share) {
    throw new Error("Access denied");
  }

  const roles = {
    'reader': 0,
    'writer': 1,
    'owner': 2
  };

  if (roles[share.role] < roles[requiredRole]) {
    throw new Error(`Requires ${requiredRole} access`);
  }

  return true;
};

// Get shared calendars
router.get("/shared", async (req, res) => {
  try {
    const shares = await CalendarShare.findAll({
      where: {
        [Op.or]: [
          { shared_with_id: req.user.id },
          { shared_with_email: req.user.email }
        ],
        status: 'accepted'
      },
      include: [{
        model: Calendar,
        include: [{
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        }]
      }]
    });

    res.json(shares);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Share calendar with another user
router.post("/:id/share", async (req, res) => {
  const { email, role = 'reader', expiresAt = null } = req.body;

  try {
    // Check if user has permission to share
    await checkCalendarAccess(req.params.id, req.user.id, 'owner');

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex');

    const share = await CalendarShare.create({
      calendar_id: req.params.id,
      shared_with_email: email,
      role,
      invitation_token: token,
      expires_at: expiresAt
    });

    // TODO: Send email invitation
    // This would typically be handled by your email service

    res.status(201).json(share);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Accept calendar share invitation
router.post("/share/:token/accept", async (req, res) => {
  try {
    const share = await CalendarShare.findOne({
      where: { 
        invitation_token: req.params.token,
        status: 'pending'
      },
      include: [{ model: Calendar }]
    });

    if (!share) {
      return res.status(404).json({ error: "Invalid or expired invitation" });
    }

    if (share.expires_at && new Date() > share.expires_at) {
      return res.status(400).json({ error: "Invitation has expired" });
    }

    // Update share record
    share.status = 'accepted';
    share.shared_with_id = req.user.id;
    await share.save();

    res.json(share);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update sharing settings
router.put("/:id/share/:shareId", async (req, res) => {
  const { role, notificationSettings, expiresAt } = req.body;

  try {
    // Check if user has permission to modify sharing
    await checkCalendarAccess(req.params.id, req.user.id, 'owner');

    const [updated] = await CalendarShare.update({
      role,
      notification_settings: notificationSettings,
      expires_at: expiresAt
    }, {
      where: { 
        id: req.params.shareId,
        calendar_id: req.params.id
      }
    });

    if (!updated) {
      return res.status(404).json({ error: "Share not found" });
    }

    const share = await CalendarShare.findByPk(req.params.shareId);
    res.json(share);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Remove calendar sharing
router.delete("/:id/share/:shareId", async (req, res) => {
  try {
    // Check if user has permission to remove sharing
    await checkCalendarAccess(req.params.id, req.user.id, 'owner');

    const deleted = await CalendarShare.destroy({
      where: { 
        id: req.params.shareId,
        calendar_id: req.params.id
      }
    });

    if (!deleted) {
      return res.status(404).json({ error: "Share not found" });
    }

    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get sync token
router.get("/:id/sync", async (req, res) => {
  try {
    await checkCalendarAccess(req.params.id, req.user.id);

    const calendar = await Calendar.findByPk(req.params.id);
    const syncToken = crypto.randomBytes(32).toString('hex');

    calendar.sync_token = syncToken;
    await calendar.save();

    res.json({ syncToken });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Sync calendar changes
router.get("/:id/changes", async (req, res) => {
  const { syncToken } = req.query;

  try {
    await checkCalendarAccess(req.params.id, req.user.id);

    const calendar = await Calendar.findByPk(req.params.id);
    
    if (syncToken !== calendar.sync_token) {
      // Token mismatch - return full calendar data
      const events = await Event.findAll({
        where: { calendar_id: req.params.id }
      });
      return res.json({
        fullSync: true,
        syncToken: calendar.sync_token,
        events
      });
    }

    // Return only changes since last sync
    const changes = await Event.findAll({
      where: {
        calendar_id: req.params.id,
        updatedAt: { [Op.gt]: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      }
    });

    res.json({
      fullSync: false,
      syncToken: calendar.sync_token,
      changes
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
