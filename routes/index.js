const express = require("express");
const router = express.Router();
const userRoutes = require("./user.route");
const eventRoutes = require("./event.route");
const taskRoutes = require("./task.route");
const notificationRoutes = require("./notification.route");
const calendarRoutes = require("./calendar.route");
const eventGuestRoutes = require("./event-guest.route");
const calendarShareRoutes = require("./calendar-share.route");
const authMiddleware = require("../middlewares/auth.middleware");

// Public routes
router.use("/users", userRoutes);

// Protected routes
router.use("/events", authMiddleware, eventRoutes);
router.use("/tasks", authMiddleware, taskRoutes); 
router.use("/notifications", authMiddleware, notificationRoutes);
router.use("/calendar", authMiddleware, calendarRoutes);
router.use("/", authMiddleware, eventGuestRoutes);  // Event guest routes mounted at root because it uses /events/:id/guests pattern
router.use("/", authMiddleware, calendarShareRoutes);  // Calendar share routes mounted at root for similar reason

module.exports = router;
