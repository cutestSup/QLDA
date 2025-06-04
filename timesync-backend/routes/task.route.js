const express = require("express");
const router = express.Router();
const Task = require("../models/task.model");

router.get("/", async (req, res) => {
  const tasks = await Task.find({ userId: req.userId });
  res.json(tasks);
});

router.post("/", async (req, res) => {
  const task = await Task.create({ ...req.body, userId: req.userId });
  res.status(201).json(task);
});

router.get("/:id", async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
  res.json(task);
});

router.put("/:id", async (req, res) => {
  const task = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, req.body, { new: true });
  res.json(task);
});

router.delete("/:id", async (req, res) => {
  await Task.deleteOne({ _id: req.params.id, userId: req.userId });
  res.sendStatus(204);
});

router.patch("/:id/complete", async (req, res) => {
  const task = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, { completed: true }, { new: true });
  res.json(task);
});

module.exports = router;
