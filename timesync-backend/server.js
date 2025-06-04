require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db.config");

const userRoutes = require("./routes/user.route");
const taskRoutes = require("./routes/task.route");
const eventRoutes = require("./routes/event.route");
const categoryRoutes = require("./routes/category.route");
const notificationRoutes = require("./routes/notification.route");
const authMiddleware = require("./middlewares/auth.middleware");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/tasks", authMiddleware, taskRoutes);
app.use("/api/events", authMiddleware, eventRoutes);
app.use("/api/categories", authMiddleware, categoryRoutes);
app.use("/api/notifications", authMiddleware, notificationRoutes);

// Start server
connectDB();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
