require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./timesync-backend/models');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', require('./timesync-backend/routes/user.route'));
app.use('/api/categories', require('./timesync-backend/routes/category.route'));
app.use('/api/tasks', require('./timesync-backend/routes/task.route'));
app.use('/api/events', require('./timesync-backend/routes/event.route'));
app.use('/api/notifications', require('./timesync-backend/routes/notification.route'));

// Database connection and server start
const initializeApp = async () => {
  try {
    await sequelize.sync();
    console.log('Database synchronized successfully');
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize app:', error);
    process.exit(1);
  }
};

initializeApp();