const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db");
const Event = require("./Event");

const Attendee = sequelize.define("Attendee", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_email: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM("pending", "accepted", "declined"),
    defaultValue: "pending"
  }
}, {
  tableName: 'attendees',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Event.hasMany(Attendee, { foreignKey: "event_id" });
Attendee.belongsTo(Event, { foreignKey: "event_id" });

module.exports = Attendee;
