const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db");
const Event = require("./Event");
const User = require("./User");

const EventGuest = sequelize.define("EventGuest", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  response_status: {
    type: DataTypes.ENUM('needsAction', 'declined', 'tentative', 'accepted'),
    defaultValue: 'needsAction'
  },
  notification_preferences: {
    type: DataTypes.JSON,
    defaultValue: [{ type: 'email', minutes: 30 }]
  },
  optional: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Optional attendee'
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  added_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  response_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  visibility: {
    type: DataTypes.ENUM('public', 'private'),
    defaultValue: 'public',
    comment: 'Control attendance visibility to other guests'
  }
}, {
  tableName: 'event_guests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Event.hasMany(EventGuest, { foreignKey: "event_id", onDelete: 'CASCADE' });
EventGuest.belongsTo(Event, { foreignKey: "event_id" });
User.hasMany(EventGuest, { foreignKey: "user_id" });
EventGuest.belongsTo(User, { foreignKey: "user_id" });

module.exports = EventGuest;
