require('dotenv').config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./timesync-backend/config/db.config");

const userRoutes = require("./timesync-backend/routes/user.route");
const taskRoutes = require("./timesync-backend/routes/task.route");
const eventRoutes = require("./timesync-backend/routes/event.route");
const categoryRoutes = require("./timesync-backend/routes/category.route");
const notificationRoutes = require("./timesync-backend/routes/notification.route");
const authMiddleware = require("./timesync-backend/middlewares/auth.middleware");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/tasks", authMiddleware, taskRoutes);
app.use("/api/events", authMiddleware, eventRoutes);
app.use("/api/categories", authMiddleware, categoryRoutes);
app.use("/api/notifications", authMiddleware, notificationRoutes);

// Initialize database and start server
const { sequelize } = require('./timesync-backend/models');

const initializeApp = async () => {
  try {
    // Sync database models
    await sequelize.sync();
    console.log('Database synchronized successfully');
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to initialize app:', error);
    process.exit(1);
  }
};

initializeApp();
