const mongoose = require("mongoose");
const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  description: String,
  dueDate: Date,
  completed: { type: Boolean, default: false },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }
}, { timestamps: true });
module.exports = mongoose.model("Task", taskSchema);
