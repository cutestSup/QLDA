const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db");
const User = require("./User");
const Calendar = require("./Calendar");

const CalendarShare = sequelize.define("CalendarShare", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  calendar_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'calendars',
      key: 'id'
    }
  },
  shared_with_email: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  shared_with_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Set when user accepts invitation'
  },
  role: {
    type: DataTypes.ENUM('reader', 'writer', 'owner'),
    defaultValue: 'reader',
    comment: 'Permission level for shared calendar'
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'declined'),
    defaultValue: 'pending'
  },
  invitation_token: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Token for accepting calendar invitation'
  },
  notification_settings: {
    type: DataTypes.JSON,
    defaultValue: {
      event_created: true,
      event_updated: true,
      event_deleted: true
    },
    comment: 'Notification preferences for shared calendar'
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Optional expiration date for calendar sharing'
  }
}, {
  tableName: 'calendar_shares',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['calendar_id', 'shared_with_email'],
      unique: true
    },
    {
      fields: ['invitation_token']
    }
  ]
});

Calendar.hasMany(CalendarShare, { foreignKey: "calendar_id", onDelete: 'CASCADE' });
CalendarShare.belongsTo(Calendar, { foreignKey: "calendar_id" });
User.hasMany(CalendarShare, { foreignKey: "shared_with_id" });
CalendarShare.belongsTo(User, { foreignKey: "shared_with_id" });

module.exports = CalendarShare;
