const mongoose = require("mongoose");
const eventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  description: String,
  startTime: Date,
  endTime: Date,
  location: String
}, { timestamps: true });
module.exports = mongoose.model("Event", eventSchema);
