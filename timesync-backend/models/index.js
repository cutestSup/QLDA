const { sequelize } = require('../config/db.config');
const User = require('./user.model');
const Category = require('./category.model');
const Task = require('./task.model');
const Event = require('./event.model');
const Notification = require('./notification.model');

// Define relationships
User.hasMany(Category, {
  foreignKey: 'userId',
  as: 'categories'
});
Category.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

User.hasMany(Task, {
  foreignKey: 'userId',
  as: 'tasks'
});
Task.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});
Task.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category'
});

User.hasMany(Event, {
  foreignKey: 'userId',
  as: 'events'
});
Event.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

User.hasMany(Notification, {
  foreignKey: 'userId',
  as: 'notifications'
});
Notification.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});
Notification.belongsTo(Event, {
  foreignKey: 'eventId',
  as: 'event'
});
Notification.belongsTo(Task, {
  foreignKey: 'taskId',
  as: 'task'
});

module.exports = {
  sequelize,
  User,
  Category,
  Task,
  Event,
  Notification
};
