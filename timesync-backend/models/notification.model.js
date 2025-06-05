const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: String,
  time: Date,
  type: { type: String, enum: ["event", "task"] },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", default: null },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", default: null },
  read: { type: Boolean, default: false }
}, { timestamps: true });
module.exports = mongoose.model("Notification", notificationSchema);
