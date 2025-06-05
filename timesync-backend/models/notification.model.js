const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('event', 'task'),
    allowNull: false
  },
  time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'event_id',
    references: {
      model: 'events',
      key: 'id'
    }
  },
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'task_id',
    references: {
      model: 'tasks',
      key: 'id'
    }
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'read_flag'
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Notification;
