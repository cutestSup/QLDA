const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db");
const User = require("./User");

const Event = sequelize.define("Event", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  all_day: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  color: {
    type: DataTypes.STRING(7), // hex color code
    defaultValue: '#039BE5' // default blue
  },
  is_recurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  recurrence_rule: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'RRULE format: FREQ=DAILY/WEEKLY/MONTHLY/YEARLY;COUNT=n;INTERVAL=n;BYDAY=MO,TU,WE;UNTIL=YYYYMMDD'
  },
  visibility: {
    type: DataTypes.ENUM('public', 'private', 'default'),
    defaultValue: 'default'
  },
  status: {
    type: DataTypes.ENUM('confirmed', 'tentative', 'cancelled'),
    defaultValue: 'confirmed'
  },
  calendar_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'For multiple calendars support'
  },
  busy_status: {
    type: DataTypes.ENUM('busy', 'free', 'tentative'),
    defaultValue: 'busy',
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  day: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  original_event_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'For recurring event exceptions'
  },
  notifications: {
    type: DataTypes.JSON,
    defaultValue: [{ type: 'email', minutes: 30 }],
    comment: 'Array of notification preferences'
  },
  attachments: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of attachment URLs'
  },
  video_link: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'For virtual meetings (Google Meet, Zoom, etc.)'
  }
}, {
  tableName: 'events',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['start_time', 'end_time'],
      name: 'idx_events_time_range'
    },
    {
      fields: ['owner_id', 'calendar_id'],
      name: 'idx_events_owner_calendar'
    }
  ]
});

User.hasMany(Event, { foreignKey: "owner_id" });
Event.belongsTo(User, { foreignKey: "owner_id" });

module.exports = Event;
