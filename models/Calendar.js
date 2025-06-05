const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db");
const User = require("./User");

const Calendar = sequelize.define("Calendar", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  color: {
    type: DataTypes.STRING(7),
    defaultValue: '#039BE5'
  },
  is_primary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  time_zone: {
    type: DataTypes.STRING(50),
    defaultValue: 'UTC'
  },
  visibility: {
    type: DataTypes.ENUM('private', 'public'),
    defaultValue: 'private'
  },
  sharing_settings: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of sharing permissions'
  },
  sync_token: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'For calendar sync'
  },
  syncToken: {
    type: DataTypes.STRING(32),
    allowNull: true,
    comment: 'Token used for calendar synchronization'
  },
  lastSyncTime: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Timestamp of last synchronization'
  }
}, {
  tableName: 'calendars',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

User.hasMany(Calendar, { foreignKey: "owner_id" });
Calendar.belongsTo(User, { foreignKey: "owner_id" });

module.exports = Calendar;
